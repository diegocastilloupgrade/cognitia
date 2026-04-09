import type { CreateSessionInput, Session } from "./sessions.types";

export class SessionsService {
  private readonly sessions: Session[] = [];
  private nextId = 1;

  list(): Session[] {
    return this.sessions;
  }

  create(input: CreateSessionInput): Session {
    const session: Session = {
      id: this.nextId++,
      patientId: input.patientId,
      createdByUserId: input.createdByUserId,
      status: "BORRADOR",
    };

    this.sessions.push(session);
    return session;
  }
}
