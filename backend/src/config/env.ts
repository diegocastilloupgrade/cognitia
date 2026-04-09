export interface EnvConfig {
  nodeEnv: string;
  port: number;
}

export function loadEnv(): EnvConfig {
  const port = Number(process.env.PORT ?? 3000);

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number.isNaN(port) ? 3000 : port,
  };
}
