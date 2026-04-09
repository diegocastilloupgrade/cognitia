import { SessionsService } from "./sessions.service";
import type { CreateSessionDto } from "./sessions.types";

export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  list() {
    return this.sessionsService.list();
  }

  create(input: CreateSessionDto) {
    return this.sessionsService.create(input);
  }
}
