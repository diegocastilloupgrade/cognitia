import { createApp } from "./app";
import { loadEnv } from "./config/env";
import { createApiRouter } from "./modules";
import { assertPostgresConnection } from "./shared/db/postgres";
import { findSessionsInProgress } from "./shared/persistence/sessions.repository";
import { requireAuth } from "./shared/middleware/require-auth";

async function bootstrap(): Promise<void> {
  const env = loadEnv();

  await assertPostgresConnection();

  const inProgressSessions = await findSessionsInProgress();
  if (inProgressSessions.length > 0) {
    console.log(
      `[Recovery] ${inProgressSessions.length} session(s) EN_EJECUCION recovered from database: ids [${inProgressSessions.map((s) => s.id).join(", ")}]`,
    );
  } else {
    console.log("[Recovery] No sessions in progress at startup.");
  }

  const app = createApp({
    router: createApiRouter(requireAuth),
  });
  const port = env.port;

  app.listen(port, () => {
    console.log(`COGNITIA backend listening on http://localhost:${port}`);
  });
}

void bootstrap().catch((error: unknown) => {
  console.error("Failed to start backend due to PostgreSQL connectivity/config error", error);
  process.exit(1);
});
