import { SessionsService } from "./sessions.service";
import type { CreateSessionInput } from "./sessions.types";

export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  list() {
    return this.sessionsService.list();
  }

  create(input: CreateSessionInput) {
    return this.sessionsService.create(input);
  }
}
