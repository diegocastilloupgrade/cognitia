import { Router } from "express";
import { getItemTimingConfig } from "./execution.config";
import type { ItemTimingState } from "./execution.types";

export const executionRouter = Router();

const itemTimingStates: ItemTimingState[] = [];

function parseSessionId(value: string): number {
  return Number(value);
}

function findItemTimingState(
  sessionId: number,
  itemCode: string
): ItemTimingState | undefined {
  return itemTimingStates.find(
    (state) => state.sessionId === sessionId && state.itemCode === itemCode
  );
}

function listItemTimingStatesBySessionId(sessionId: number): ItemTimingState[] {
  return itemTimingStates.filter((state) => state.sessionId === sessionId);
}

function upsertItemTimingState(sessionId: number, itemCode: string): ItemTimingState {
  const config = getItemTimingConfig(itemCode);
  const state: ItemTimingState = {
    sessionId,
    itemCode,
    startedAt: new Date().toISOString(),
    durationSeconds: config.durationSeconds,
    silenceThresholdSeconds: config.silenceThresholdSeconds,
    silenceEvents: [],
    completed: false,
  };

  const existingIndex = itemTimingStates.findIndex(
    (item) => item.sessionId === sessionId && item.itemCode === itemCode
  );

  if (existingIndex >= 0) {
    itemTimingStates[existingIndex] = state;
  } else {
    itemTimingStates.push(state);
  }

  return state;
}

executionRouter.get("/runtime", (_req, res) => {
  res.json({ status: "idle" });
});

executionRouter.get("/session/:sessionId/item/:itemCode/state", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const { itemCode } = req.params;

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  const state = findItemTimingState(sessionId, itemCode);
  if (!state) {
    res.status(404).json({ message: "Timing state not found" });
    return;
  }

  res.json(state);
});

executionRouter.get("/session/:sessionId/state", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  res.json(listItemTimingStatesBySessionId(sessionId));
});

executionRouter.post("/session/:sessionId/item/:itemCode/start", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const { itemCode } = req.params;

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  const state = upsertItemTimingState(sessionId, itemCode);
  res.status(201).json(state);
});

executionRouter.post("/session/:sessionId/item/:itemCode/silence", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const { itemCode } = req.params;
  const body = req.body as { level?: unknown };

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  if (body.level !== 1 && body.level !== 2) {
    res.status(400).json({ message: "level must be 1 or 2" });
    return;
  }

  const state = findItemTimingState(sessionId, itemCode);
  if (!state || state.completed) {
    res.status(404).json({ message: "Active timing state not found" });
    return;
  }

  state.silenceEvents.push({
    occurredAt: new Date().toISOString(),
    type: body.level === 1 ? "FIRST_SILENCE" : "SECOND_SILENCE",
  });

  res.json(state);
});

executionRouter.post("/session/:sessionId/item/:itemCode/complete", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const { itemCode } = req.params;

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  const state = findItemTimingState(sessionId, itemCode);
  if (!state) {
    res.status(404).json({ message: "Timing state not found" });
    return;
  }

  state.completed = true;
  res.json(state);
});
