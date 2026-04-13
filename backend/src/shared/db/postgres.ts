import { Pool } from "pg";
import { loadEnv } from "../../config/env";

let pool: Pool | null = null;

export function getPostgresPool(): Pool {
  if (pool) {
    return pool;
  }

  const env = loadEnv();

  pool = new Pool({
    host: env.dbHost,
    port: env.dbPort,
    database: env.dbName,
    user: env.dbUser,
    password: env.dbPassword,
    ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
  });

  return pool;
}

export async function assertPostgresConnection(): Promise<void> {
  const client = await getPostgresPool().connect();

  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

export async function closePostgresPool(): Promise<void> {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}
