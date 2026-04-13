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
}

export function loadEnv(): EnvConfig {
  const port = Number(process.env.PORT ?? 3000);

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number.isNaN(port) ? 3000 : port,
    storeFilePath: process.env.COGNITIA_STORE_FILE ?? "data/app-store.json",
    jwtSecret: process.env.JWT_SECRET ?? "change-me-dev-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
    seedUser: process.env.COGNITIA_SEED_USER ?? "clinician@cognitia.local",
    seedPass: process.env.COGNITIA_SEED_PASS ?? "clinician-demo-pass",
  };
}
