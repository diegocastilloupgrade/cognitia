import { Router } from "express";
import type {
  EvaluatedOutcome,
  ItemResultPayload,
} from "./results.types";

export const resultsRouter = Router();

const sessionResults: ItemResultPayload[] = [];
let nextResultId = 1;

function parseSessionId(value: string): number {
  return Number(value);
}

function addResult(input: {
  sessionId: number;
  itemCode: string;
  positionInSession: number;
  evaluatedOutcome: EvaluatedOutcome;
  data: any;
}): ItemResultPayload {
  const result: ItemResultPayload = {
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

function listBySessionId(sessionId: number): ItemResultPayload[] {
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

  if (
    typeof body.itemCode !== "string" ||
    typeof body.positionInSession !== "number" ||
    (body.evaluatedOutcome !== "ACIERTO" &&
      body.evaluatedOutcome !== "ERROR" &&
      body.evaluatedOutcome !== "OMISION" &&
      body.evaluatedOutcome !== "NO_APLICA")
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
    evaluatedOutcome: body.evaluatedOutcome,
    data: body.data,
  });

  res.status(201).json(created);
});
