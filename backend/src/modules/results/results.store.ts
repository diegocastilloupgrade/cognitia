import { listResultsBySession, upsertResult } from "../../shared/persistence/results.repository";
import type {
  AnyCreateResultInput,
  EvaluatedOutcome,
  ItemCode,
  ItemResultDataByCode,
  ItemResultData_3_1,
  SessionReviewPayload,
  SessionReviewSummary,
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

export async function listResultsBySessionId(sessionId: number): Promise<SessionResult[]> {
  return listResultsBySession(sessionId);
}

function extractResponseTimeMs(data: unknown): number | null {
  if (!isRecord(data) || typeof data.responseTimeMs !== "number") {
    return null;
  }

  return data.responseTimeMs;
}

export function buildSessionReviewSummary(results: SessionResult[]): SessionReviewSummary {
  const outcomes: Record<EvaluatedOutcome, number> = {
    ACIERTO: 0,
    ERROR: 0,
    OMISION: 0,
    NO_APLICA: 0,
  };

  const distinctItems = new Set<ItemCode>();
  const responseTimes: number[] = [];

  for (const result of results) {
    outcomes[result.evaluatedOutcome] += 1;
    distinctItems.add(result.itemCode);

    const responseTimeMs = extractResponseTimeMs(result.data);
    if (responseTimeMs !== null) {
      responseTimes.push(responseTimeMs);
    }
  }

  const averageResponseTimeMs =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((acc, value) => acc + value, 0) / responseTimes.length)
      : null;

  return {
    totalResults: results.length,
    distinctItems: distinctItems.size,
    outcomes,
    averageResponseTimeMs,
  };
}

export async function buildSessionReviewPayload(sessionId: number): Promise<SessionReviewPayload> {
  const results = await listResultsBySessionId(sessionId);

  return {
    sessionId,
    summary: buildSessionReviewSummary(results),
    results,
  };
}

export function persistResult(input: AnyCreateResultInput): SessionResult {
  throw new Error("persistResult sync API was replaced. Use persistResultAsync.");
}

export async function persistResultAsync(input: AnyCreateResultInput): Promise<SessionResult> {
  return upsertResult(input);
}