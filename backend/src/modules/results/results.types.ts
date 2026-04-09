export interface SessionResult {
  id: string;
  sessionId: string;
  score: number;
  createdAt: string;
}

export interface CreateResultInput {
  sessionId: string;
  score: number;
}
