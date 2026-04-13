import assert from "node:assert/strict";
import test from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import jwt from "jsonwebtoken";
import { createApp } from "../../app";
import { createApiRouter } from "../index";
import { requireAuth } from "../../shared/middleware/require-auth";

type JsonValue = Record<string, unknown> | Array<unknown>;

async function startProtectedServer(): Promise<{ server: Server; baseUrl: string }> {
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.COGNITIA_SEED_USER = "clinician@cognitia.local";
  process.env.COGNITIA_SEED_PASS = "test-pass";

  const app = createApp({
    router: createApiRouter(requireAuth),
  });

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
  options?: RequestInit,
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

test("auth login contract returns JWT for valid credentials", async (t) => {
  const { server, baseUrl } = await startProtectedServer();
  t.after(() => server.close());

  const response = await jsonRequest(baseUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "clinician@cognitia.local",
      password: "test-pass",
    }),
  });

  assert.equal(response.status, 200);
  const body = response.body as Record<string, unknown>;
  assert.equal(typeof body.accessToken, "string");
  assert.equal(typeof body.expiresInSeconds, "number");

  const decoded = jwt.verify(body.accessToken as string, "test-secret") as jwt.JwtPayload;
  assert.equal(decoded.email, "clinician@cognitia.local");
  assert.equal(decoded.role, "clinician");
});

test("auth login contract rejects invalid credentials", async (t) => {
  const { server, baseUrl } = await startProtectedServer();
  t.after(() => server.close());

  const response = await jsonRequest(baseUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "clinician@cognitia.local",
      password: "wrong-pass",
    }),
  });

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { message: "Invalid credentials" });
});

test("auth login contract rejects malformed body", async (t) => {
  const { server, baseUrl } = await startProtectedServer();
  t.after(() => server.close());

  const response = await jsonRequest(baseUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "clinician@cognitia.local" }),
  });

  assert.equal(response.status, 400);
});

test("forgot-password returns generic accepted response", async (t) => {
  const { server, baseUrl } = await startProtectedServer();
  t.after(() => server.close());

  const response = await jsonRequest(baseUrl, "/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: "unknown@cognitia.local" }),
  });

  assert.equal(response.status, 202);
  assert.equal(
    (response.body as Record<string, unknown>).message,
    "If the account exists, a recovery token has been generated.",
  );
});

test("reset-password allows login with new password and rejects old password", async (t) => {
  const { server, baseUrl } = await startProtectedServer();
  t.after(() => server.close());

  const forgot = await jsonRequest(baseUrl, "/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: "clinician@cognitia.local" }),
  });

  assert.equal(forgot.status, 202);
  const token = (forgot.body as Record<string, unknown>).resetToken;
  assert.equal(typeof token, "string");

  const reset = await jsonRequest(baseUrl, "/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword: "new-test-pass" }),
  });
  assert.equal(reset.status, 200);

  const oldPasswordLogin = await jsonRequest(baseUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "clinician@cognitia.local",
      password: "test-pass",
    }),
  });
  assert.equal(oldPasswordLogin.status, 401);

  const newPasswordLogin = await jsonRequest(baseUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "clinician@cognitia.local",
      password: "new-test-pass",
    }),
  });
  assert.equal(newPasswordLogin.status, 200);
});

test("reset-password rejects reused token", async (t) => {
  const { server, baseUrl } = await startProtectedServer();
  t.after(() => server.close());

  const forgot = await jsonRequest(baseUrl, "/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: "clinician@cognitia.local" }),
  });
  const token = (forgot.body as Record<string, unknown>).resetToken;

  const firstReset = await jsonRequest(baseUrl, "/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword: "new-test-pass" }),
  });
  assert.equal(firstReset.status, 200);

  const secondReset = await jsonRequest(baseUrl, "/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword: "another-pass" }),
  });
  assert.equal(secondReset.status, 400);
});

test("requireAuth middleware rejects request without token", async (t) => {
  const { server, baseUrl } = await startProtectedServer();
  t.after(() => server.close());

  const response = await jsonRequest(baseUrl, "/api/patients");

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { message: "Unauthorized" });
});

test("requireAuth middleware rejects expired token", async (t) => {
  const { server, baseUrl } = await startProtectedServer();
  t.after(() => server.close());

  const expiredToken = jwt.sign({ email: "clinician@cognitia.local" }, "test-secret", {
    expiresIn: -1,
  });

  const response = await jsonRequest(baseUrl, "/api/patients", {
    headers: {
      Authorization: `Bearer ${expiredToken}`,
    },
  });

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { message: "Unauthorized" });
});

test("requireAuth middleware allows request with valid token", async (t) => {
  const { server, baseUrl } = await startProtectedServer();
  t.after(() => server.close());

  const validToken = jwt.sign({ email: "clinician@cognitia.local" }, "test-secret", {
    expiresIn: "1h",
  });

  const response = await jsonRequest(baseUrl, "/api/patients", {
    headers: {
      Authorization: `Bearer ${validToken}`,
    },
  });

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.body), true);
});
