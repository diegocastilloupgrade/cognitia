import { MockUnithClient } from "./unith-client.mock";
import { UnithService } from "./unith.service";

export function createUnithIntegrationModule() {
  const client = new MockUnithClient();
  const service = new UnithService(client);

  return {
    name: "integrations.unith",
    client,
    service,
    mode: "mock" as const,
  };
}

export type UnithIntegrationModule = ReturnType<typeof createUnithIntegrationModule>;
