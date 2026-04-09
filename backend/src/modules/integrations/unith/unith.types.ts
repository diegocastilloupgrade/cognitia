export interface UnithSessionPayload {
  externalSessionId: string;
  patientId: string;
  metadata?: Record<string, unknown>;
}

export interface UnithResultPayload {
  externalSessionId: string;
  score: number;
  rawData?: Record<string, unknown>;
}

export interface UnithAck {
  accepted: boolean;
  message: string;
}
