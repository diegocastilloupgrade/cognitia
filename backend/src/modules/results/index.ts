import { Router } from "express";
import type {
  AnyCreateResultInput,
  ItemCode,
} from "./results.types";
import {
  buildSessionReviewPayload,
  isValidDataForItemCode,
  isValidItemCode,
  listResultsBySessionId,
  persistResultAsync,
  resolveEvaluatedOutcome,
} from "./results.store";

export const resultsRouter = Router();

function parseSessionId(value: string): number {
  return Number(value);
}

resultsRouter.get("/session/:sessionId", async (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  if (req.query.includeSummary === "true") {
    res.json(await buildSessionReviewPayload(sessionId));
    return;
  }

  res.json(await listResultsBySessionId(sessionId));
});

resultsRouter.get("/session/:sessionId/review", async (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  res.json(await buildSessionReviewPayload(sessionId));
});

resultsRouter.post("/session/:sessionId", async (req, res) => {
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

  const created = await persistResultAsync({
    sessionId,
    itemCode: body.itemCode,
    positionInSession: body.positionInSession,
    evaluatedOutcome,
    data: body.data,
  });

  res.status(201).json(created);
});
