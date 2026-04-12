import { Router } from "express";
import type {
  AnyCreateResultInput,
  EvaluatedOutcome,
  ItemCode,
  ItemResultDataByCode,
  ItemResultData_3_1,
  SessionResult,
} from "./results.types";

export const resultsRouter = Router();

const sessionResults: SessionResult[] = [];
let nextResultId = 1;

const ITEM_CODES: ItemCode[] = ["3.1", "3.2", "3.3", "3.4.1", "3.4.2", "3.5", "3.6", "3.7"];

function parseSessionId(value: string): number {
  return Number(value);
}

function isEvaluatedOutcome(value: unknown): value is EvaluatedOutcome {
  return (
    value === "ACIERTO" ||
    value === "ERROR" ||
    value === "OMISION" ||
    value === "NO_APLICA"
  );
}

function isItemResultData3_1(value: unknown): value is ItemResultData_3_1 {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.stimulusId === "string" &&
    typeof candidate.recognizedText === "string" &&
    typeof candidate.isCorrect === "boolean"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isValidItemCode(value: unknown): value is ItemCode {
  return typeof value === "string" && ITEM_CODES.includes(value as ItemCode);
}

function isValidDataForItemCode<TCode extends ItemCode>(
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

function resolveEvaluatedOutcome(input: {
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

function addResult(input: AnyCreateResultInput): SessionResult {
  const result: SessionResult = {
    id: nextResultId++,
    sessionId: input.sessionId,
    itemCode: input.itemCode,
    positionInSession: input.positionInSession,
    evaluatedOutcome: input.evaluatedOutcome,
    data: input.data,
    createdAt: new Date().toISOString(),
  };

  sessionResults.push(result);
  return result;
}

function listBySessionId(sessionId: number): SessionResult[] {
  return sessionResults.filter((item) => item.sessionId === sessionId);
}

resultsRouter.get("/session/:sessionId", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  res.json(listBySessionId(sessionId));
});

resultsRouter.post("/session/:sessionId", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  const body = req.body as {
    itemCode?: unknown;
    positionInSession?: unknown;
    evaluatedOutcome?: unknown;
    data?: unknown;
  };

  if (!isValidItemCode(body.itemCode)) {
    res.status(400).json({ message: "itemCode is invalid or unsupported" });
    return;
  }

  if (!isValidDataForItemCode(body.itemCode, body.data)) {
    res.status(400).json({ message: "data payload shape does not match itemCode" });
    return;
  }

  const evaluatedOutcome = resolveEvaluatedOutcome({
    itemCode: body.itemCode,
    evaluatedOutcome: body.evaluatedOutcome,
    data: body.data,
  });

  if (
    typeof body.positionInSession !== "number" ||
    !evaluatedOutcome
  ) {
    res.status(400).json({
      message:
        "itemCode, positionInSession and evaluatedOutcome are required with valid types",
    });
    return;
  }

  const created = addResult({
    sessionId,
    itemCode: body.itemCode,
    positionInSession: body.positionInSession,
    evaluatedOutcome,
    data: body.data,
  });

  res.status(201).json(created);
});
