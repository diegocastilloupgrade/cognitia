import assert from "node:assert/strict";
import test, { describe } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../../app";
import { getPostgresPool } from "../../shared/db/postgres";

type JsonValue = Record<string, unknown> | Array<unknown>;

async function truncateAllTables(): Promise<void> {
  await getPostgresPool().query(
    "TRUNCATE patients, sessions, runtime_sessions, item_timing_states, session_results RESTART IDENTITY CASCADE",
  );
}

async function startTestServer(): Promise<{ server: Server; baseUrl: string }> {
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

async function createTestSession(baseUrl: string): Promise<number> {
  const patientRes = await jsonRequest(baseUrl, "/api/patients", {
    method: "POST",
    body: JSON.stringify({ fullName: "Test Patient", birthDate: "1990-01-01" }),
  });
  const patientId = (patientRes.body as Record<string, unknown>).id as number;

  const sessionRes = await jsonRequest(baseUrl, "/api/sessions", {
    method: "POST",
    body: JSON.stringify({ patientId, createdByUserId: 1 }),
  });

  return (sessionRes.body as Record<string, unknown>).id as number;
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

describe("results module", { concurrency: 1 }, () => {
  test("results contract rejects invalid session id", async (t) => {
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const response = await jsonRequest(baseUrl, "/api/results/session/invalid");

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { message: "Invalid sessionId" });
  });

  test("results contract stores and lists typed payload by session", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const sessionId = await createTestSession(baseUrl);

    const created = await jsonRequest(baseUrl, `/api/results/session/${sessionId}`, {
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

    const listed = await jsonRequest(baseUrl, `/api/results/session/${sessionId}`);

    assert.equal(listed.status, 200);
    assert.equal((listed.body as Array<unknown>).length, 1);

    const firstResult = (listed.body as Array<Record<string, unknown>>)[0];
    assert.equal(firstResult.itemCode, "3.1");
    assert.equal(firstResult.positionInSession, 1);
    assert.equal((firstResult.data as Record<string, unknown>).stimulusId, "img-01");
  });

  test("results review contract returns summary with aggregates", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const sessionId = await createTestSession(baseUrl);

    await jsonRequest(baseUrl, `/api/results/session/${sessionId}`, {
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

    await jsonRequest(baseUrl, `/api/results/session/${sessionId}`, {
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

    const summaryFromQuery = await jsonRequest(baseUrl, `/api/results/session/${sessionId}?includeSummary=true`);
    assert.equal(summaryFromQuery.status, 200);

    const queryPayload = summaryFromQuery.body as Record<string, unknown>;
    const querySummary = queryPayload.summary as Record<string, unknown>;

    assert.equal(queryPayload.sessionId, sessionId);
    assert.equal((queryPayload.results as Array<unknown>).length, 2);
    assert.equal(querySummary.totalResults, 2);
    assert.equal(querySummary.distinctItems, 2);
    assert.equal(querySummary.averageResponseTimeMs, 1500);

    const outcomes = querySummary.outcomes as Record<string, number>;
    assert.equal(outcomes.ACIERTO, 1);
    assert.equal(outcomes.OMISION, 1);
    assert.equal(outcomes.ERROR, 0);
    assert.equal(outcomes.NO_APLICA, 0);

    const summaryFromReviewEndpoint = await jsonRequest(baseUrl, `/api/results/session/${sessionId}/review`);
    assert.equal(summaryFromReviewEndpoint.status, 200);

    const reviewPayload = summaryFromReviewEndpoint.body as Record<string, unknown>;
    assert.deepEqual(reviewPayload.summary, querySummary);
  });
});
