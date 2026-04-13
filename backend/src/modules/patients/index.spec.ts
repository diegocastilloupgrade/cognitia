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

  if (response.status === 204) {
    return { status: response.status, body: {} };
  }

  return {
    status: response.status,
    body: (await response.json()) as JsonValue,
  };
}

describe("patients module", { concurrency: 1 }, () => {
  test("PATCH /patients/:id updates patient fields", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const created = await jsonRequest(baseUrl, "/api/patients", {
      method: "POST",
      body: JSON.stringify({ fullName: "Paciente Uno", birthDate: "1990-01-01" }),
    });
    assert.equal(created.status, 201);
    const id = Number((created.body as Record<string, unknown>).id);

    const updated = await jsonRequest(baseUrl, `/api/patients/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ fullName: "Paciente Editado" }),
    });

    assert.equal(updated.status, 200);
    assert.equal((updated.body as Record<string, unknown>).fullName, "Paciente Editado");
    assert.equal((updated.body as Record<string, unknown>).birthDate, "1990-01-01");
  });

  test("PATCH /patients/:id validates birthDate format", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const created = await jsonRequest(baseUrl, "/api/patients", {
      method: "POST",
      body: JSON.stringify({ fullName: "Paciente Dos", birthDate: "1991-02-02" }),
    });
    assert.equal(created.status, 201);
    const id = Number((created.body as Record<string, unknown>).id);

    const invalid = await jsonRequest(baseUrl, `/api/patients/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ birthDate: "2026/12/01" }),
    });

    assert.equal(invalid.status, 400);
    assert.equal(
      (invalid.body as Record<string, unknown>).message,
      "birthDate must be a valid ISO date (YYYY-MM-DD)",
    );
  });

  test("PATCH /patients/:id returns 404 when patient does not exist", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const response = await jsonRequest(baseUrl, "/api/patients/99999", {
      method: "PATCH",
      body: JSON.stringify({ fullName: "No Existe" }),
    });

    assert.equal(response.status, 404);
    assert.equal((response.body as Record<string, unknown>).message, "Patient not found");
  });

  test("DELETE /patients/:id removes patient when no open sessions", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const created = await jsonRequest(baseUrl, "/api/patients", {
      method: "POST",
      body: JSON.stringify({ fullName: "Paciente Borrable", birthDate: "1992-03-03" }),
    });
    assert.equal(created.status, 201);
    const id = Number((created.body as Record<string, unknown>).id);

    const deleted = await jsonRequest(baseUrl, `/api/patients/${id}`, {
      method: "DELETE",
    });

    assert.equal(deleted.status, 204);

    const getDeleted = await jsonRequest(baseUrl, `/api/patients/${id}`);
    assert.equal(getDeleted.status, 404);
  });

  test("DELETE /patients/:id returns 409 when patient has open sessions", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const createdPatient = await jsonRequest(baseUrl, "/api/patients", {
      method: "POST",
      body: JSON.stringify({ fullName: "Paciente Con Sesion", birthDate: "1993-04-04" }),
    });
    assert.equal(createdPatient.status, 201);
    const patientId = Number((createdPatient.body as Record<string, unknown>).id);

    const sessionCreated = await jsonRequest(baseUrl, "/api/sessions", {
      method: "POST",
      body: JSON.stringify({ patientId, createdByUserId: 1 }),
    });
    assert.equal(sessionCreated.status, 201);

    const deleted = await jsonRequest(baseUrl, `/api/patients/${patientId}`, {
      method: "DELETE",
    });

    assert.equal(deleted.status, 409);
    assert.equal(
      (deleted.body as Record<string, unknown>).message,
      "Cannot delete patient with active sessions",
    );
  });

  test("DELETE /patients/:id returns 404 for missing patient", async (t) => {
    await truncateAllTables();
    const { server, baseUrl } = await startTestServer();
    t.after(() => server.close());

    const deleted = await jsonRequest(baseUrl, "/api/patients/123456", {
      method: "DELETE",
    });

    assert.equal(deleted.status, 404);
    assert.equal((deleted.body as Record<string, unknown>).message, "Patient not found");
  });
});
