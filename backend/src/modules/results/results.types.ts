export type EvaluatedOutcome =
  | "ACIERTO"
  | "ERROR"
  | "OMISION"
  | "NO_APLICA";

export type ItemCode =
  | "3.1"
  | "3.2"
  | "3.3"
  | "3.4.1"
  | "3.4.2"
  | "3.5"
  | "3.6"
  | "3.7";

export interface ItemResultBase {
  id: number;
  sessionId: number;
  itemCode: ItemCode;
  positionInSession: number;
  createdAt: string;
  evaluatedOutcome: EvaluatedOutcome;
}

export interface ItemResultData_3_1 {
  stimulusId: string;
  recognizedText: string;
  isCorrect: boolean;
  responseTimeMs?: number;
}

export interface ItemResultData_3_2 {
  recognizedText: string;
  responseTimeMs: number;
  wasCompleted: boolean;
}

export interface ItemResultData_3_3 {
  recognizedText: string;
  responseTimeMs: number;
  wasCompleted: boolean;
}

export interface ItemResultData_3_4_1 {
  recognizedSequence: string[];
  firstErrorIndex: number | null;
}

export interface ItemResultData_3_4_2 {
  errors: number;
  omissions: number;
}

export interface ItemResultData_3_5 {
  producedCount: number;
  elapsedSeconds: number;
  recognizedText: string;
}

export interface ItemResultData_3_6 {
  recalledItems: string[];
  recognizedText: string;
}

export interface ItemResultData_3_7 {
  recalledItems: string[];
  cueType: string;
  recognizedText: string;
}

export interface ItemResultDataByCode {
  "3.1": ItemResultData_3_1;
  "3.2": ItemResultData_3_2;
  "3.3": ItemResultData_3_3;
  "3.4.1": ItemResultData_3_4_1;
  "3.4.2": ItemResultData_3_4_2;
  "3.5": ItemResultData_3_5;
  "3.6": ItemResultData_3_6;
  "3.7": ItemResultData_3_7;
}

export interface ItemResultPayload<TCode extends ItemCode = ItemCode>
  extends Omit<ItemResultBase, "itemCode"> {
  itemCode: TCode;
  data: ItemResultDataByCode[TCode];
}

export type DiscriminatedItemResultPayload = {
  [TCode in ItemCode]: ItemResultPayload<TCode>;
}[ItemCode];

// Compatibility aliases for existing skeleton service/controller files.
export type SessionResult = ItemResultPayload<ItemCode>;

export interface CreateResultInput<TCode extends ItemCode = ItemCode> {
  sessionId: number;
  itemCode: TCode;
  positionInSession: number;
  evaluatedOutcome: EvaluatedOutcome;
  data: ItemResultDataByCode[TCode];
}

export type DiscriminatedCreateResultInput = {
  [TCode in ItemCode]: CreateResultInput<TCode>;
}[ItemCode];

export type AnyCreateResultInput = CreateResultInput<ItemCode>;

export interface SessionReviewSummary {
  totalResults: number;
  distinctItems: number;
  outcomes: Record<EvaluatedOutcome, number>;
  averageResponseTimeMs: number | null;
}

export interface SessionReviewPayload {
  sessionId: number;
  summary: SessionReviewSummary;
  results: SessionResult[];
}
