export interface EnvConfig {
  nodeEnv: string;
  port: number;
  storeFilePath: string;
}

export function loadEnv(): EnvConfig {
  const port = Number(process.env.PORT ?? 3000);

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number.isNaN(port) ? 3000 : port,
    storeFilePath: process.env.COGNITIA_STORE_FILE ?? "data/app-store.json",
  };
}
