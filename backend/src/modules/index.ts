import { createAuthModule } from "./auth";
import { createExecutionModule } from "./execution";
import { createUnithIntegrationModule } from "./integrations/unith";
import { createPatientsModule } from "./patients";
import { createResultsModule } from "./results";
import { createSessionsModule } from "./sessions";

export function createModules() {
  return {
    auth: createAuthModule(),
    patients: createPatientsModule(),
    sessions: createSessionsModule(),
    results: createResultsModule(),
    execution: createExecutionModule(),
    integrations: {
      unith: createUnithIntegrationModule(),
    },
  };
}

export type AppModules = ReturnType<typeof createModules>;
