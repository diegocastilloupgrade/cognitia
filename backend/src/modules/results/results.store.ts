import { readStoreState, updateStoreState } from "../../shared/persistence/app-store";
import type {
  AnyCreateResultInput,
  EvaluatedOutcome,
  ItemCode,
  ItemResultDataByCode,
  ItemResultData_3_1,
  SessionResult,
} from "./results.types";

export const ITEM_CODES: ItemCode[] = ["3.1", "3.2", "3.3", "3.4.1", "3.4.2", "3.5", "3.6", "3.7"];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isItemResultData3_1(value: unknown): value is ItemResultData_3_1 {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.stimulusId === "string" &&
    typeof value.recognizedText === "string" &&
    typeof value.isCorrect === "boolean"
  );
}

export function isEvaluatedOutcome(value: unknown): value is EvaluatedOutcome {
  return value === "ACIERTO" || value === "ERROR" || value === "OMISION" || value === "NO_APLICA";
}

export function isValidItemCode(value: unknown): value is ItemCode {
  return typeof value === "string" && ITEM_CODES.includes(value as ItemCode);
}

export function isValidDataForItemCode<TCode extends ItemCode>(
  itemCode: TCode,
  value: unknown
): value is ItemResultDataByCode[TCode] {
  if (!isRecord(value)) {
    return false;
  }

  switch (itemCode) {
    case "3.1":
      return isItemResultData3_1(value);
    case "3.2":
    case "3.3":
      return (
        typeof value.recognizedText === "string" &&
        typeof value.responseTimeMs === "number" &&
        typeof value.wasCompleted === "boolean"
      );
    case "3.4.1":
      return isStringArray(value.recognizedSequence) && (value.firstErrorIndex === null || typeof value.firstErrorIndex === "number");
    case "3.4.2":
      return typeof value.errors === "number" && typeof value.omissions === "number";
    case "3.5":
      return (
        typeof value.producedCount === "number" &&
        typeof value.elapsedSeconds === "number" &&
        typeof value.recognizedText === "string"
      );
    case "3.6":
      return isStringArray(value.recalledItems) && typeof value.recognizedText === "string";
    case "3.7":
      return (
        isStringArray(value.recalledItems) &&
        typeof value.cueType === "string" &&
        typeof value.recognizedText === "string"
      );
    default:
      return false;
  }
}

export function resolveEvaluatedOutcome(input: {
  itemCode: ItemCode;
  evaluatedOutcome: unknown;
  data: unknown;
}): EvaluatedOutcome | undefined {
  if (input.itemCode === "3.1" && isItemResultData3_1(input.data)) {
    return input.data.isCorrect ? "ACIERTO" : "ERROR";
  }

  if (isEvaluatedOutcome(input.evaluatedOutcome)) {
    return input.evaluatedOutcome;
  }

  return undefined;
}

export function listResultsBySessionId(sessionId: number): SessionResult[] {
  return readStoreState().results.filter((item) => item.sessionId === sessionId);
}

export function persistResult(input: AnyCreateResultInput): SessionResult {
  return updateStoreState((store) => {
    const existing = store.results.find(
      (item) => item.sessionId === input.sessionId && item.itemCode === input.itemCode
    );

    if (existing) {
      existing.positionInSession = input.positionInSession;
      existing.evaluatedOutcome = input.evaluatedOutcome;
      existing.data = input.data;
      return existing;
    }

    const result: SessionResult = {
      id: store.counters.nextResultId++,
      sessionId: input.sessionId,
      itemCode: input.itemCode,
      positionInSession: input.positionInSession,
      evaluatedOutcome: input.evaluatedOutcome,
      data: input.data,
      createdAt: new Date().toISOString(),
    };

    store.results.push(result);
    return result;
  });
}