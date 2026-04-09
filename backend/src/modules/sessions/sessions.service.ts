import type { CreateSessionInput, Session } from "./sessions.types";

export class SessionsService {
  private readonly sessions: Session[] = [];

  list(): Session[] {
    return this.sessions;
  }

  create(input: CreateSessionInput): Session {
    const session: Session = {
      id: `session-${this.sessions.length + 1}`,
      patientId: input.patientId,
      status: "scheduled",
    };

    this.sessions.push(session);
    return session;
  }
}
