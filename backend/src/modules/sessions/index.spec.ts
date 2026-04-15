import assert from "node:assert/strict";
import test, { describe } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../../app";
import { getPostgresPool } from "../../shared/db/postgres";
import { validateCompleteTransition, validateStartTransition } from "./state-validation";

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
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
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

async function createPatient(baseUrl: string, fullName = "Paciente Sesion"): Promise<number> {
  const created = await jsonRequest(baseUrl, "/api/patients", {
    method: "POST",
    body: JSON.stringify({ fullName, birthDate: "1990-01-01" }),
  });
  assert.equal(created.status, 201);
  return Number((created.body as Record<string, unknown>).id);
}

async function createResult(baseUrl: string, sessionId: number): Promise<void> {
  const created = await jsonRequest(baseUrl, `/api/results/session/${sessionId}`, {
    method: "POST",
    body: JSON.stringify({
      itemCode: "3.1",
      positionInSession: 1,
      data: {
        stimulusId: "stim-1",
        recognizedText: "texto",
        isCorrect: true,
      },
    }),
  });
  assert.equal(created.status, 201);
}

describe("sessions transition validation utility", () => {
  test("validateStartTransition rejects already executed sessions", () => {
    const result = validateStartTransition({
      id: 1,
      patientId: 1,
      createdByUserId: 1,
      status: "BORRADOR",
      startedAt: "2026-04-15T10:00:00.000Z",
    });
    assert.equal(result.valid, false);
    assert.equal(result.message, "Cannot re-start session: already executed");
  });

  test("validateStartTransition rejects missing patient", () => {
    const result = validateStartTransition({
      id: 1,
      patientId: 0,
      createdByUserId: 1,
      status: "BORRADOR",
    });
    assert.equal(result.valid, false);
    assert.equal(result.message, "Cannot start session: no patient assigned");
  });

  test("validateCompleteTransition rejects missing results", () => {
    const result = validateCompleteTransition({
      id: 1,
      patientId: 1,
      createdByUserId: 1,
      status: "EN_EJECUCION",
    }, 0);

    assert.equal(result.valid, false);
    assert.equal(result.message, "Cannot complete session: no results recorded");
  });
});

describe("sessions module", { concurrency: 1 }, () => {
  test("POST /sessions creates session when no open session exists", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Libre");

    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });

    assert.equal(created.status, 201);
    assert.equal((created.body as Record<string, unknown>).patientId, patientId);
    assert.equal((created.body as Record<string, unknown>).status, "BORRADOR");
  });

  test("POST /sessions rejects duplicate open session for same patient", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Duplicado");

    const first = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    assert.equal(first.status, 201);

    const second = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });

    assert.equal(second.status, 409);
    assert.equal(
      (second.body as Record<string, unknown>).message,
      "Patient already has an open session",
    );
  });

  test("POST /sessions allows new session after previous one is completed", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Reintento");

    const first = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    assert.equal(first.status, 201);
    const sessionId = Number((first.body as Record<string, unknown>).id);

    const started = await jsonRequest(baseUrl, `/api/sessions/${sessionId}/start`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    assert.equal(started.status, 200);

    await createResult(baseUrl, sessionId);

    const completed = await jsonRequest(baseUrl, `/api/sessions/${sessionId}/complete`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    assert.equal(completed.status, 200);

    const second = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });

    assert.equal(second.status, 201);
    assert.notEqual((second.body as Record<string, unknown>).id, sessionId);
  });

  test("POST /sessions handles concurrent duplicate attempts with one success and one conflict", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Carrera");

    const [first, second] = await Promise.all([
      jsonRequest(baseUrl, "/api/sessions", {
        method: "POST",
        body: JSON.stringify({ patientId, createdByUserId: 1 }),
      }),
      jsonRequest(baseUrl, "/api/sessions", {
        method: "POST",
        body: JSON.stringify({ patientId, createdByUserId: 1 }),
      }),
    ]);

    const statuses = [first.status, second.status].sort((a, b) => a - b);
    assert.deepEqual(statuses, [201, 409]);
  });
});

describe("sessions state transitions", { concurrency: 1 }, () => {
  test("POST /sessions/:id/start transitions BORRADOR to EN_EJECUCION and sets startedAt", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Inicio");
    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    assert.equal(created.status, 201);
    const sessionId = Number((created.body as Record<string, unknown>).id);

    const started = await jsonRequest(baseUrl, `/api/sessions/${sessionId}/start`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    assert.equal(started.status, 200);
    assert.equal((started.body as Record<string, unknown>).status, "EN_EJECUCION");
    assert.ok(typeof (started.body as Record<string, unknown>).startedAt === "string");
  });

  test("POST /sessions/:id/start rejects transition from COMPLETADA", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Completado");
    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    const sessionId = Number((created.body as Record<string, unknown>).id);

    await jsonRequest(baseUrl, `/api/sessions/${sessionId}/start`, { method: "POST", body: JSON.stringify({}) });
    await createResult(baseUrl, sessionId);
    await jsonRequest(baseUrl, `/api/sessions/${sessionId}/complete`, { method: "POST", body: JSON.stringify({}) });

    const result = await jsonRequest(baseUrl, `/api/sessions/${sessionId}/start`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    assert.equal(result.status, 400);
  });

  test("POST /sessions/:id/complete transitions EN_EJECUCION to COMPLETADA and sets finishedAt", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Completa");
    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    const sessionId = Number((created.body as Record<string, unknown>).id);

    await jsonRequest(baseUrl, `/api/sessions/${sessionId}/start`, { method: "POST", body: JSON.stringify({}) });
    await createResult(baseUrl, sessionId);

    const completed = await jsonRequest(baseUrl, `/api/sessions/${sessionId}/complete`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    assert.equal(completed.status, 200);
    assert.equal((completed.body as Record<string, unknown>).status, "COMPLETADA");
    assert.ok(typeof (completed.body as Record<string, unknown>).finishedAt === "string");
  });

  test("POST /sessions/:id/complete rejects transition from BORRADOR", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Borrador");
    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    const sessionId = Number((created.body as Record<string, unknown>).id);

    const result = await jsonRequest(baseUrl, `/api/sessions/${sessionId}/complete`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    assert.equal(result.status, 400);
  });

  test("POST /sessions/:id/complete rejects EN_EJECUCION when results are missing", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Sin Resultados");
    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    const sessionId = Number((created.body as Record<string, unknown>).id);

    await jsonRequest(baseUrl, `/api/sessions/${sessionId}/start`, { method: "POST", body: JSON.stringify({}) });

    const result = await jsonRequest(baseUrl, `/api/sessions/${sessionId}/complete`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    assert.equal(result.status, 400);
    assert.equal((result.body as Record<string, unknown>).message, "Cannot complete session: no results recorded");
  });

  test("DELETE /sessions/:id deletes a BORRADOR session", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Borrar");
    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    const sessionId = Number((created.body as Record<string, unknown>).id);

    const deleted = await fetch(`${baseUrl}/api/sessions/${sessionId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    assert.equal(deleted.status, 204);

    const fetched = await jsonRequest(baseUrl, `/api/sessions/${sessionId}`, {});
    assert.equal(fetched.status, 404);
  });

  test("DELETE /sessions/:id rejects deletion of EN_EJECUCION session", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente En Ejecucion");
    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    const sessionId = Number((created.body as Record<string, unknown>).id);

    await jsonRequest(baseUrl, `/api/sessions/${sessionId}/start`, { method: "POST", body: JSON.stringify({}) });

    const result = await jsonRequest(baseUrl, `/api/sessions/${sessionId}`, { method: "DELETE" });
    assert.equal(result.status, 409);
  });

  test("DELETE /sessions/:id rejects deletion of COMPLETADA session", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Completada");
    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    const sessionId = Number((created.body as Record<string, unknown>).id);

    await jsonRequest(baseUrl, `/api/sessions/${sessionId}/start`, { method: "POST", body: JSON.stringify({}) });
    await createResult(baseUrl, sessionId);
    await jsonRequest(baseUrl, `/api/sessions/${sessionId}/complete`, { method: "POST", body: JSON.stringify({}) });

    const result = await jsonRequest(baseUrl, `/api/sessions/${sessionId}`, { method: "DELETE" });
    assert.equal(result.status, 409);
  });

  test("PATCH /sessions/:id rejects edit when COMPLETADA", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Patch Completa");
    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    const sessionId = Number((created.body as Record<string, unknown>).id);

    await jsonRequest(baseUrl, `/api/sessions/${sessionId}/start`, { method: "POST", body: JSON.stringify({}) });
    await createResult(baseUrl, sessionId);
    await jsonRequest(baseUrl, `/api/sessions/${sessionId}/complete`, { method: "POST", body: JSON.stringify({}) });

    const patched = await jsonRequest(baseUrl, `/api/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({ patientId: patientId + 1 }),
    });

    assert.equal(patched.status, 403);
  });

  test("PATCH /sessions/:id updates BORRADOR fields", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const patientId = await createPatient(baseUrl, "Paciente Patch Draft");
    const patientId2 = await createPatient(baseUrl, "Paciente Patch Draft 2");
    const created = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    const sessionId = Number((created.body as Record<string, unknown>).id);

    const patched = await jsonRequest(baseUrl, `/api/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({ patientId: patientId2, createdByUserId: 5 }),
    });

    assert.equal(patched.status, 200);
    assert.equal((patched.body as Record<string, unknown>).patientId, patientId2);
    assert.equal((patched.body as Record<string, unknown>).createdByUserId, 5);
  });
});
