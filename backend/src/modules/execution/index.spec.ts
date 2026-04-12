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
    (((firstSilence.body as Record<string, unknown>).state as Record<string, unknown>)
      .silenceEvents as Array<Record<string, unknown>>)[0].type,
    "FIRST_SILENCE"
  );
  assert.equal(
    ((firstSilence.body as Record<string, unknown>).avatarFeedback as Record<string, unknown>).messageCode,
    "SILENCE_FIRST_PROMPT"
  );

  const secondSilence = await jsonRequest(baseUrl, "/api/execution/session/1/item/3.1/silence", {
    method: "POST",
    body: JSON.stringify({ level: 2 }),
  });

  assert.equal(secondSilence.status, 200);
  assert.equal(
    (((secondSilence.body as Record<string, unknown>).state as Record<string, unknown>)
      .silenceEvents as Array<Record<string, unknown>>)[1].type,
    "SECOND_SILENCE"
  );
  assert.equal(
    ((secondSilence.body as Record<string, unknown>).avatarFeedback as Record<string, unknown>).messageCode,
    "SILENCE_SECOND_PROMPT"
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

test("execution silence endpoint accepts mock event envelope and escalates automatically", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const start = await jsonRequest(baseUrl, "/api/execution/session/3/item/3.1/start", {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert.equal(start.status, 201);

  const firstSilence = await jsonRequest(baseUrl, "/api/execution/session/3/item/3.1/silence", {
    method: "POST",
    body: JSON.stringify({
      event: {
        source: "MOCK",
        eventType: "SILENCE_DETECTED",
        sessionId: 3,
        itemCode: "3.1",
        occurredAt: new Date().toISOString(),
      },
    }),
  });

  assert.equal(firstSilence.status, 200);
  assert.equal(
    (((firstSilence.body as Record<string, unknown>).state as Record<string, unknown>)
      .silenceEvents as Array<Record<string, unknown>>)[0].type,
    "FIRST_SILENCE"
  );

  const secondSilence = await jsonRequest(baseUrl, "/api/execution/session/3/item/3.1/silence", {
    method: "POST",
    body: JSON.stringify({
      event: {
        source: "MOCK",
        eventType: "SILENCE_DETECTED",
        sessionId: 3,
        itemCode: "3.1",
        occurredAt: new Date().toISOString(),
      },
    }),
  });

  assert.equal(secondSilence.status, 200);
  assert.equal(
    (((secondSilence.body as Record<string, unknown>).state as Record<string, unknown>)
      .silenceEvents as Array<Record<string, unknown>>)[1].type,
    "SECOND_SILENCE"
  );
});

test("execution silence endpoint rejects out-of-sequence silence levels", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const start = await jsonRequest(baseUrl, "/api/execution/session/4/item/3.1/start", {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert.equal(start.status, 201);

  const invalidSequence = await jsonRequest(baseUrl, "/api/execution/session/4/item/3.1/silence", {
    method: "POST",
    body: JSON.stringify({ level: 2 }),
  });

  assert.equal(invalidSequence.status, 409);
  assert.equal(
    (invalidSequence.body as Record<string, unknown>).message,
    "Silence level out of sequence; expected level 1"
  );
});