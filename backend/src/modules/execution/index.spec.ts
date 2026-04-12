import assert from "node:assert/strict";
import test from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../../app";

type JsonValue = Record<string, unknown> | Array<unknown>;

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

async function jsonRequest(
  baseUrl: string,
  path: string,
  options?: RequestInit
): Promise<{ status: number; body: JsonValue }> {
  const response = await fetch(`${baseUrl}${path}`, {
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

test("execution timing flow supports start, silence, complete and state queries", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const start = await jsonRequest(baseUrl, "/api/execution/session/1/item/3.1/start", {
    method: "POST",
    body: JSON.stringify({}),
  });

  assert.equal(start.status, 201);
  assert.equal((start.body as Record<string, unknown>).itemCode, "3.1");
  assert.equal((start.body as Record<string, unknown>).durationSeconds, 60);
  assert.deepEqual((start.body as Record<string, unknown>).silenceEvents, []);

  const firstSilence = await jsonRequest(baseUrl, "/api/execution/session/1/item/3.1/silence", {
    method: "POST",
    body: JSON.stringify({ level: 1 }),
  });

  assert.equal(firstSilence.status, 200);
  assert.equal(
    ((firstSilence.body as Record<string, unknown>).silenceEvents as Array<Record<string, unknown>>)[0].type,
    "FIRST_SILENCE"
  );

  const secondSilence = await jsonRequest(baseUrl, "/api/execution/session/1/item/3.1/silence", {
    method: "POST",
    body: JSON.stringify({ level: 2 }),
  });

  assert.equal(secondSilence.status, 200);
  assert.equal(
    ((secondSilence.body as Record<string, unknown>).silenceEvents as Array<Record<string, unknown>>)[1].type,
    "SECOND_SILENCE"
  );

  const singleState = await jsonRequest(baseUrl, "/api/execution/session/1/item/3.1/state");
  assert.equal(singleState.status, 200);
  assert.equal((singleState.body as Record<string, unknown>).completed, false);

  const sessionState = await jsonRequest(baseUrl, "/api/execution/session/1/state");
  assert.equal(sessionState.status, 200);
  assert.equal((sessionState.body as Array<unknown>).length, 1);

  const complete = await jsonRequest(baseUrl, "/api/execution/session/1/item/3.1/complete", {
    method: "POST",
    body: JSON.stringify({}),
  });

  assert.equal(complete.status, 200);
  assert.equal((complete.body as Record<string, unknown>).runtimeStatus, "IN_PROGRESS");
  assert.equal(
    ((complete.body as Record<string, unknown>).completedItem as Record<string, unknown>).completed,
    true
  );
  assert.equal(
    ((
      (complete.body as Record<string, unknown>).completedItem as Record<string, unknown>
    ).silenceEvents as Array<unknown>).length,
    2
  );
  assert.equal(
    ((complete.body as Record<string, unknown>).activeItem as Record<string, unknown>).itemCode,
    "3.4.1"
  );
});

test("execution timing state returns 404 when missing", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const response = await jsonRequest(baseUrl, "/api/execution/session/999/item/3.1/state");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { message: "Timing state not found" });
});

test("execution runtime rejects events from inactive items", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const start31 = await jsonRequest(baseUrl, "/api/execution/session/2/item/3.1/start", {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert.equal(start31.status, 201);

  const start341 = await jsonRequest(baseUrl, "/api/execution/session/2/item/3.4.1/start", {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert.equal(start341.status, 201);

  const staleItemSilence = await jsonRequest(baseUrl, "/api/execution/session/2/item/3.1/silence", {
    method: "POST",
    body: JSON.stringify({ level: 1 }),
  });

  assert.equal(staleItemSilence.status, 409);
  assert.equal(
    (staleItemSilence.body as Record<string, unknown>).message,
    "Runtime event rejected for item 3.1; active item is 3.4.1"
  );
});