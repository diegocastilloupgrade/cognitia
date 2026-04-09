import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";

export function createSessionsModule() {
  const service = new SessionsService();
  const controller = new SessionsController(service);

  return {
    name: "sessions",
    service,
    controller,
  };
}

export type SessionsModule = ReturnType<typeof createSessionsModule>;
