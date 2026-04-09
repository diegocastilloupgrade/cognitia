import { loadEnv } from "./config/env";
import { createModules } from "./modules";
import { logInfo } from "./shared/logger";

function bootstrap(): void {
  const env = loadEnv();
  const modules = createModules();

  logInfo("Backend skeleton initialized", {
    nodeEnv: env.nodeEnv,
    port: env.port,
    modules: {
      auth: modules.auth.name,
      patients: modules.patients.name,
      sessions: modules.sessions.name,
      results: modules.results.name,
      execution: modules.execution.name,
      unithMode: modules.integrations.unith.mode,
    },
  });
}

bootstrap();
