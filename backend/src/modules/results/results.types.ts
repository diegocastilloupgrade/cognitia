export type EvaluatedOutcome =
  | "ACIERTO"
  | "ERROR"
  | "OMISION"
  | "NO_APLICA";

export interface ItemResultBase {
  id: number;
  sessionId: number;
  itemCode: string;
  positionInSession: number;
  createdAt: string;
  evaluatedOutcome: EvaluatedOutcome;
}

export interface ItemResultData_3_1 {
  stimulusId: string;
  recognizedText: string;
  isCorrect: boolean;
}

export interface ItemResultPayload<TData = any> extends ItemResultBase {
  data: TData;
}

// Compatibility aliases for existing skeleton service/controller files.
export type SessionResult = ItemResultPayload;

export interface CreateResultInput {
  sessionId: number;
  itemCode: string;
  positionInSession: number;
  evaluatedOutcome: EvaluatedOutcome;
  data: any;
}
