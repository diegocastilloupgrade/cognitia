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
  return path.join(os.tmpdir(), `cognitia-store-${randomUUID()}.json`);
}

async function startTestServer(options?: {
  storeFilePath?: string;
  resetStore?: boolean;
}): Promise<{ server: Server; baseUrl: string; storeFilePath: string }> {
  const storeFilePath = options?.storeFilePath ?? createTestStorePath();
  process.env.COGNITIA_STORE_FILE = storeFilePath;

  if (options?.resetStore ?? true) {
    resetStoreStateForTests();
  }

  const app = createApp();

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address() as AddressInfo;
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
        storeFilePath,
      });
    });
  });
}

async function createAndStartSession(baseUrl: string, patientId: number): Promise<number> {
  const created = await jsonRequest(baseUrl, "/api/sessions", {
    method: "POST",
    body: JSON.stringify({ patientId, createdByUserId: 1 }),
  });

  assert.equal(created.status, 201);
  const sessionId = (created.body as Record<string, unknown>).id as number;

  const started = await jsonRequest(baseUrl, `/api/sessions/${sessionId}/start`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  assert.equal(started.status, 200);
  return sessionId;
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
  const sessionId = await createAndStartSession(baseUrl, 1);

  const start = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/start`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  assert.equal(start.status, 201);
  assert.equal((start.body as Record<string, unknown>).itemCode, "3.1");
  assert.equal((start.body as Record<string, unknown>).durationSeconds, 60);
  assert.deepEqual((start.body as Record<string, unknown>).silenceEvents, []);

  const firstSilence = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/silence`, {
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

  const secondSilence = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/silence`, {
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

  const singleState = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/state`);
  assert.equal(singleState.status, 200);
  assert.equal((singleState.body as Record<string, unknown>).completed, false);

  const sessionState = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/state`);
  assert.equal(sessionState.status, 200);
  assert.equal((sessionState.body as Array<unknown>).length, 1);

  const runtimeStateBeforeComplete = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/runtime-state`);
  assert.equal(runtimeStateBeforeComplete.status, 200);
  assert.equal((runtimeStateBeforeComplete.body as Record<string, unknown>).recoveryStatus, "READY");
  assert.equal(
    ((runtimeStateBeforeComplete.body as Record<string, unknown>).activeItem as Record<string, unknown>).itemCode,
    "3.1"
  );

  const complete = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/complete`, {
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

  const runtimeStateAfterComplete = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/runtime-state`);
  assert.equal(runtimeStateAfterComplete.status, 200);
  assert.equal(
    ((runtimeStateAfterComplete.body as Record<string, unknown>).activeItem as Record<string, unknown>).itemCode,
    "3.4.1"
  );
});

test("execution timing state returns 404 when missing", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());
  const sessionId = await createAndStartSession(baseUrl, 2);

  const response = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.3/state`);

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { message: "Timing state not found" });
});

test("execution runtime-state returns null active item before runtime starts", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const created = await jsonRequest(baseUrl, "/api/sessions", {
    method: "POST",
    body: JSON.stringify({ patientId: 42, createdByUserId: 1 }),
  });

  assert.equal(created.status, 201);
  const sessionId = (created.body as Record<string, unknown>).id as number;

  const response = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/runtime-state`);

  assert.equal(response.status, 200);
  assert.equal((response.body as Record<string, unknown>).sessionId, sessionId);
  assert.equal((response.body as Record<string, unknown>).runtimeStatus, "IN_PROGRESS");
  assert.equal((response.body as Record<string, unknown>).recoveryStatus, "NOT_STARTED");
  assert.equal((response.body as Record<string, unknown>).activeItem, null);
});

test("execution runtime rejects events from inactive items", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());
  const sessionId = await createAndStartSession(baseUrl, 3);

  const start31 = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/start`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert.equal(start31.status, 201);

  const start341 = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.4.1/start`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert.equal(start341.status, 201);

  const staleItemSilence = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/silence`, {
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
  const sessionId = await createAndStartSession(baseUrl, 4);

  const start = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/start`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert.equal(start.status, 201);

  const firstSilence = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/silence`, {
    method: "POST",
    body: JSON.stringify({
      event: {
        source: "MOCK",
        eventType: "SILENCE_DETECTED",
        sessionId,
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

  const secondSilence = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/silence`, {
    method: "POST",
    body: JSON.stringify({
      event: {
        source: "MOCK",
        eventType: "SILENCE_DETECTED",
        sessionId,
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
  const sessionId = await createAndStartSession(baseUrl, 5);

  const start = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/start`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert.equal(start.status, 201);

  const invalidSequence = await jsonRequest(baseUrl, `/api/execution/session/${sessionId}/item/3.1/silence`, {
    method: "POST",
    body: JSON.stringify({ level: 2 }),
  });

  assert.equal(invalidSequence.status, 409);
  assert.equal(
    (invalidSequence.body as Record<string, unknown>).message,
    "Silence level out of sequence; expected level 1"
  );
});

test("execution runtime-state survives backend restart with the same persistent store", async (t) => {
  const storeFilePath = createTestStorePath();
  const firstServer = await startTestServer({ storeFilePath, resetStore: true });
  t.after(() => {
    process.env.COGNITIA_STORE_FILE = storeFilePath;
    resetStoreStateForTests();
  });

  const sessionId = await createAndStartSession(firstServer.baseUrl, 6);

  const firstRuntimeState = await jsonRequest(firstServer.baseUrl, `/api/execution/session/${sessionId}/runtime-state`);
  assert.equal(firstRuntimeState.status, 200);
  assert.equal(
    ((firstRuntimeState.body as Record<string, unknown>).activeItem as Record<string, unknown>).itemCode,
    "3.1"
  );

  firstServer.server.close();

  const restartedServer = await startTestServer({ storeFilePath, resetStore: false });
  t.after(() => restartedServer.server.close());

  const resumedRuntimeState = await jsonRequest(restartedServer.baseUrl, `/api/execution/session/${sessionId}/runtime-state`);
  assert.equal(resumedRuntimeState.status, 200);
  assert.equal((resumedRuntimeState.body as Record<string, unknown>).recoveryStatus, "READY");
  assert.equal(
    ((resumedRuntimeState.body as Record<string, unknown>).activeItem as Record<string, unknown>).itemCode,
    "3.1"
  );
});

test("finalize-item persists item result consistently and keeps it after restart", async (t) => {
  const storeFilePath = createTestStorePath();
  const firstServer = await startTestServer({ storeFilePath, resetStore: true });
  t.after(() => {
    process.env.COGNITIA_STORE_FILE = storeFilePath;
    resetStoreStateForTests();
  });

  const sessionId = await createAndStartSession(firstServer.baseUrl, 7);

  const complete = await jsonRequest(firstServer.baseUrl, `/api/execution/session/${sessionId}/item/3.1/complete`, {
    method: "POST",
    body: JSON.stringify({
      positionInSession: 1,
      evaluatedOutcome: "ACIERTO",
      resultData: {
        stimulusId: "mv-01",
        recognizedText: "guitarra",
        isCorrect: true,
        responseTimeMs: 10,
      },
    }),
  });

  assert.equal(complete.status, 200);

  const resultsBeforeRestart = await jsonRequest(firstServer.baseUrl, `/api/results/session/${sessionId}`);
  assert.equal(resultsBeforeRestart.status, 200);
  assert.equal((resultsBeforeRestart.body as Array<unknown>).length, 1);
  assert.equal(
    ((((resultsBeforeRestart.body as Array<unknown>)[0] as Record<string, unknown>).data as Record<string, unknown>).stimulusId),
    "mv-01"
  );

  firstServer.server.close();

  const restartedServer = await startTestServer({ storeFilePath, resetStore: false });
  t.after(() => restartedServer.server.close());

  const resultsAfterRestart = await jsonRequest(restartedServer.baseUrl, `/api/results/session/${sessionId}`);
  assert.equal(resultsAfterRestart.status, 200);
  assert.equal((resultsAfterRestart.body as Array<unknown>).length, 1);
  assert.equal(
    ((((resultsAfterRestart.body as Array<unknown>)[0] as Record<string, unknown>).data as Record<string, unknown>).stimulusId),
    "mv-01"
  );
});