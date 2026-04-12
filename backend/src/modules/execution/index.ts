import { Router } from "express";
import { getItemTimingConfig, getNextItemCode } from "./execution.config";
import type { ItemTimingState, RuntimeSessionState } from "./execution.types";
import { parseMockSilenceEvent } from "../integrations";

export const executionRouter = Router();

const runtimeSessions: RuntimeSessionState[] = [];

function parseSessionId(value: string): number {
  return Number(value);
}

function findRuntimeSession(sessionId: number): RuntimeSessionState | undefined {
  return runtimeSessions.find((session) => session.sessionId === sessionId);
}

function listItemTimingStatesBySessionId(sessionId: number): ItemTimingState[] {
  return findRuntimeSession(sessionId)?.itemTimingStates ?? [];
}

function findItemTimingState(sessionId: number, itemCode: string): ItemTimingState | undefined {
  const session = findRuntimeSession(sessionId);
  return session?.itemTimingStates.find((state) => state.itemCode === itemCode);
}

function getOrCreateRuntimeSession(sessionId: number): RuntimeSessionState {
  const existing = findRuntimeSession(sessionId);
  if (existing) {
    return existing;
  }

  const state: RuntimeSessionState = {
    sessionId,
    status: "IN_PROGRESS",
    activeItemCode: null,
    itemTimingStates: [],
  };

  runtimeSessions.push(state);
  return state;
}

function upsertItemTimingState(sessionId: number, itemCode: string): ItemTimingState {
  const session = getOrCreateRuntimeSession(sessionId);
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

  const existingIndex = session.itemTimingStates.findIndex((item) => item.itemCode === itemCode);

  if (existingIndex >= 0) {
    session.itemTimingStates[existingIndex] = state;
  } else {
    session.itemTimingStates.push(state);
  }

  session.activeItemCode = itemCode;
  session.status = "IN_PROGRESS";

  return state;
}

function markItemCompleted(sessionId: number, itemCode: string): ItemTimingState | undefined {
  const session = findRuntimeSession(sessionId);
  if (!session) {
    return undefined;
  }

  const state = session.itemTimingStates.find((item) => item.itemCode === itemCode);
  if (!state) {
    return undefined;
  }

  state.completed = true;

  if (session.activeItemCode === itemCode) {
    session.activeItemCode = null;
  }

  const allCompleted =
    session.itemTimingStates.length > 0 && session.itemTimingStates.every((item) => item.completed);

  if (allCompleted) {
    session.status = "COMPLETED";
  }

  return state;
}

function buildActiveItemMetadata(state: ItemTimingState | null): Record<string, unknown> | null {
  if (!state) {
    return null;
  }

  return {
    itemCode: state.itemCode,
    startedAt: state.startedAt,
    durationSeconds: state.durationSeconds,
    silenceThresholdSeconds: state.silenceThresholdSeconds,
  };
}

function buildSilenceFeedback(level: 1 | 2): { messageCode: string; text: string } {
  if (level === 1) {
    return {
      messageCode: "SILENCE_FIRST_PROMPT",
      text: "Tómate un momento y responde cuando estés listo.",
    };
  }

  return {
    messageCode: "SILENCE_SECOND_PROMPT",
    text: "Si necesitas ayuda, puedes intentarlo una vez más ahora.",
  };
}

function assertActiveItem(sessionId: number, itemCode: string): string | null {
  const session = findRuntimeSession(sessionId);
  if (!session) {
    return "Active runtime session not found";
  }

  if (session.activeItemCode !== itemCode) {
    return `Runtime event rejected for item ${itemCode}; active item is ${session.activeItemCode ?? "none"}`;
  }

  return null;
}

executionRouter.get("/runtime", (_req, res) => {
  res.json({
    status: "ready",
    activeSessions: runtimeSessions.filter((session) => session.status === "IN_PROGRESS").length,
  });
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

  const parsedEvent = parseMockSilenceEvent(body, sessionId, itemCode);
  if (!parsedEvent.isValid) {
    res.status(400).json({ message: parsedEvent.error ?? "Invalid silence payload" });
    return;
  }

  const state = findItemTimingState(sessionId, itemCode);
  if (!state || state.completed) {
    res.status(404).json({ message: "Active timing state not found" });
    return;
  }

  const activeItemError = assertActiveItem(sessionId, itemCode);
  if (activeItemError) {
    res.status(409).json({ message: activeItemError });
    return;
  }

  const expectedLevel = (state.silenceEvents.length + 1) as 1 | 2 | 3;
  if (expectedLevel > 2) {
    res.status(409).json({ message: "Silence escalation already reached SECOND_SILENCE" });
    return;
  }

  if (body.level !== undefined && body.level !== expectedLevel) {
    res.status(409).json({
      message: `Silence level out of sequence; expected level ${expectedLevel}`,
    });
    return;
  }

  const silenceLevel = expectedLevel as 1 | 2;

  state.silenceEvents.push({
    occurredAt: new Date().toISOString(),
    type: silenceLevel === 1 ? "FIRST_SILENCE" : "SECOND_SILENCE",
  });

  res.json({
    state,
    avatarFeedback: buildSilenceFeedback(silenceLevel),
  });
});

executionRouter.post("/session/:sessionId/item/:itemCode/complete", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const { itemCode } = req.params;

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  const activeItemError = assertActiveItem(sessionId, itemCode);
  if (activeItemError) {
    res.status(409).json({ message: activeItemError });
    return;
  }

  const state = markItemCompleted(sessionId, itemCode);
  if (!state) {
    res.status(404).json({ message: "Timing state not found" });
    return;
  }

  const runtimeSession = findRuntimeSession(sessionId);
  if (!runtimeSession) {
    res.status(404).json({ message: "Active runtime session not found" });
    return;
  }

  const nextItemCode = getNextItemCode(itemCode);
  let activeItemState: ItemTimingState | null = null;

  if (nextItemCode) {
    activeItemState = upsertItemTimingState(sessionId, nextItemCode);
  } else {
    runtimeSession.status = "COMPLETED";
    runtimeSession.activeItemCode = null;
  }

  res.json({
    sessionId,
    completedItem: state,
    runtimeStatus: runtimeSession.status,
    activeItem: buildActiveItemMetadata(activeItemState),
  });
});
