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
