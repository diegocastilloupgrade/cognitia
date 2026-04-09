import type { CreateResultInput, SessionResult } from "./results.types";

export class ResultsService {
  private readonly results: SessionResult[] = [];

  listBySession(sessionId: string): SessionResult[] {
    return this.results.filter((item) => item.sessionId === sessionId);
  }

  create(input: CreateResultInput): SessionResult {
    const result: SessionResult = {
      id: `result-${this.results.length + 1}`,
      sessionId: input.sessionId,
      score: input.score,
      createdAt: new Date().toISOString(),
    };

    this.results.push(result);
    return result;
  }
}
