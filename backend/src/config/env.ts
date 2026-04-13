import dotenv from "dotenv";

dotenv.config();

export interface EnvConfig {
  nodeEnv: string;
  port: number;
  storeFilePath: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  seedUser: string;
  seedPass: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbSsl: boolean;
}

export function loadEnv(): EnvConfig {
  const port = Number(process.env.PORT ?? 3000);
  const dbPort = Number(process.env.DB_PORT ?? 5433);

  if (Number.isNaN(dbPort)) {
    throw new Error("DB_PORT must be a valid number");
  }

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number.isNaN(port) ? 3000 : port,
    storeFilePath: process.env.COGNITIA_STORE_FILE ?? "data/app-store.json",
    jwtSecret: process.env.JWT_SECRET ?? "change-me-dev-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
    seedUser: process.env.COGNITIA_SEED_USER ?? "clinician@cognitia.local",
    seedPass: process.env.COGNITIA_SEED_PASS ?? "clinician-demo-pass",
    dbHost: process.env.DB_HOST ?? "localhost",
    dbPort,
    dbName: process.env.DB_NAME ?? "cognitia",
    dbUser: process.env.DB_USER ?? "cognitia",
    dbPassword: process.env.DB_PASSWORD ?? "cognitia_dev_password",
    dbSsl: (process.env.DB_SSL ?? "false").toLowerCase() === "true",
  };
}
