import assert from "node:assert/strict";
import test from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createApp } from "../../app";
import { resetStoreStateForTests } from "../../shared/persistence/app-store";

type JsonValue = Record<string, unknown> | Array<unknown>;

function createTestStorePath(): string {
  return path.join(os.tmpdir(), `cognitia-results-store-${randomUUID()}.json`);
}

async function startTestServer(): Promise<{ server: Server; baseUrl: string }> {
  process.env.COGNITIA_STORE_FILE = createTestStorePath();
  resetStoreStateForTests();

  const app = createApp();

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address() as AddressInfo;
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

async function jsonRequest(
  baseUrl: string,
  requestPath: string,
  options?: RequestInit
): Promise<{ status: number; body: JsonValue }> {
  const response = await fetch(`${baseUrl}${requestPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  return {
    status: response.status,
    body: (await response.json()) as JsonValue,
  };
}

test("results contract rejects invalid session id", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const response = await jsonRequest(baseUrl, "/api/results/session/invalid");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { message: "Invalid sessionId" });
});

test("results contract stores and lists typed payload by session", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const created = await jsonRequest(baseUrl, "/api/results/session/101", {
    method: "POST",
    body: JSON.stringify({
      itemCode: "3.1",
      positionInSession: 1,
      evaluatedOutcome: "ACIERTO",
      data: {
        stimulusId: "img-01",
        recognizedText: "guitarra",
        isCorrect: true,
        responseTimeMs: 900,
      },
    }),
  });

  assert.equal(created.status, 201);

  const listed = await jsonRequest(baseUrl, "/api/results/session/101");

  assert.equal(listed.status, 200);
  assert.equal((listed.body as Array<unknown>).length, 1);

  const firstResult = (listed.body as Array<Record<string, unknown>>)[0];
  assert.equal(firstResult.itemCode, "3.1");
  assert.equal(firstResult.positionInSession, 1);
  assert.equal((firstResult.data as Record<string, unknown>).stimulusId, "img-01");
});

test("results review contract returns summary with aggregates", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  await jsonRequest(baseUrl, "/api/results/session/202", {
    method: "POST",
    body: JSON.stringify({
      itemCode: "3.1",
      positionInSession: 1,
      evaluatedOutcome: "ACIERTO",
      data: {
        stimulusId: "img-01",
        recognizedText: "guitarra",
        isCorrect: true,
        responseTimeMs: 1000,
      },
    }),
  });

  await jsonRequest(baseUrl, "/api/results/session/202", {
    method: "POST",
    body: JSON.stringify({
      itemCode: "3.2",
      positionInSession: 2,
      evaluatedOutcome: "OMISION",
      data: {
        recognizedText: "",
        responseTimeMs: 2000,
        wasCompleted: false,
      },
    }),
  });

  const summaryFromQuery = await jsonRequest(baseUrl, "/api/results/session/202?includeSummary=true");
  assert.equal(summaryFromQuery.status, 200);

  const queryPayload = summaryFromQuery.body as Record<string, unknown>;
  const querySummary = queryPayload.summary as Record<string, unknown>;

  assert.equal(queryPayload.sessionId, 202);
  assert.equal((queryPayload.results as Array<unknown>).length, 2);
  assert.equal(querySummary.totalResults, 2);
  assert.equal(querySummary.distinctItems, 2);
  assert.equal(querySummary.averageResponseTimeMs, 1500);

  const outcomes = querySummary.outcomes as Record<string, number>;
  assert.equal(outcomes.ACIERTO, 1);
  assert.equal(outcomes.OMISION, 1);
  assert.equal(outcomes.ERROR, 0);
  assert.equal(outcomes.NO_APLICA, 0);

  const summaryFromReviewEndpoint = await jsonRequest(baseUrl, "/api/results/session/202/review");
  assert.equal(summaryFromReviewEndpoint.status, 200);

  const reviewPayload = summaryFromReviewEndpoint.body as Record<string, unknown>;
  assert.deepEqual(reviewPayload.summary, querySummary);
});
