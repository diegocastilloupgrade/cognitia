import type { CreateResultInput, SessionResult } from "./results.types";

export class ResultsService {
  private readonly results: SessionResult[] = [];
  private nextId = 1;

  listBySession(sessionId: number): SessionResult[] {
    return this.results.filter((item) => item.sessionId === sessionId);
  }

  create(input: CreateResultInput): SessionResult {
    const result: SessionResult = {
      id: this.nextId++,
      sessionId: input.sessionId,
      itemCode: input.itemCode,
      positionInSession: input.positionInSession,
      evaluatedOutcome: input.evaluatedOutcome,
      data: input.data,
      createdAt: new Date().toISOString(),
    };

    this.results.push(result);
    return result;
  }
}
