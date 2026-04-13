import { Router } from "express";
import { getItemTimingConfig, getNextItemCode, ITEM_TIMING_CONFIGS } from "./execution.config";
import type {
  FinalizeItemRequest,
  FinalizeItemResponse,
  ItemTimingState,
  RuntimeSessionStateResponse,
  RuntimeSessionState,
} from "./execution.types";
import type { EvaluatedOutcome, ItemCode } from "../results/results.types";
import { parseMockSilenceEvent } from "../integrations";
import {
  isValidDataForItemCode,
  listResultsBySessionId,
  resolveEvaluatedOutcome,
} from "../results/results.store";
import {
  appendSilenceEvent,
  countActiveRuntimeSessions,
  finalizeItemAtomic,
  getItemTimingState,
  getRuntimeSession,
  listItemTimingStates,
  upsertItemTimingState,
} from "../../shared/persistence/runtime.repository";
import { findSessionById } from "../../shared/persistence/sessions.repository";

export const executionRouter = Router();

function parseSessionId(value: string): number {
  return Number(value);
}

function buildActiveItemMetadata(
  state: ItemTimingState | null
): FinalizeItemResponse["activeItem"] {
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

async function resolvePositionInSession(sessionId: number, itemCode: ItemCode, requestedPosition?: number): Promise<number> {
  if (typeof requestedPosition === "number" && requestedPosition > 0) {
    return requestedPosition;
  }

  const existingResults = await listResultsBySessionId(sessionId);
  const existingForItem = existingResults.find((result) => result.itemCode === itemCode);
  if (existingForItem) {
    return existingForItem.positionInSession;
  }

  const configuredIndex = ITEM_TIMING_CONFIGS.findIndex((item) => item.itemCode === itemCode);
  if (configuredIndex >= 0) {
    return configuredIndex + 1;
  }

  return existingResults.length + 1;
}

async function assertActiveItem(sessionId: number, itemCode: ItemCode): Promise<string | null> {
  const session = await getRuntimeSession(sessionId);
  if (!session) {
    return "Active runtime session not found";
  }

  if (session.activeItemCode !== itemCode) {
    return `Runtime event rejected for item ${itemCode}; active item is ${session.activeItemCode ?? "none"}`;
  }

  return null;
}

async function resolveRecoveryStatus(sessionId: number): Promise<RuntimeSessionStateResponse["recoveryStatus"]> {
  const session = await findSessionById(sessionId);
  const runtimeSession = await getRuntimeSession(sessionId);

  if (!session || session.status === "BORRADOR") {
    return "NOT_STARTED";
  }

  if (!runtimeSession) {
    return "MISSING_RUNTIME_STATE";
  }

  if (runtimeSession.status === "IN_PROGRESS" && !runtimeSession.activeItemCode) {
    return "MISSING_ACTIVE_ITEM";
  }

  return "READY";
}

export async function initializeRuntimeSession(sessionId: number): Promise<RuntimeSessionState> {
  const existing = await getRuntimeSession(sessionId);
  if (existing?.activeItemCode || existing?.status === "COMPLETED") {
    return existing;
  }

  const firstItemCode = ITEM_TIMING_CONFIGS[0]?.itemCode ?? getItemTimingConfig("3.1").itemCode;
  const config = getItemTimingConfig(firstItemCode);
  await upsertItemTimingState({
    sessionId,
    itemCode: firstItemCode,
    startedAt: new Date().toISOString(),
    durationSeconds: config.durationSeconds,
    silenceThresholdSeconds: config.silenceThresholdSeconds,
  });

  return (await getRuntimeSession(sessionId)) as RuntimeSessionState;
}

executionRouter.get("/runtime", async (_req, res) => {
  const activeSessions = await countActiveRuntimeSessions();
  res.json({
    status: "ready",
    activeSessions,
  });
});

executionRouter.get("/session/:sessionId/item/:itemCode/state", async (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const itemCode = req.params.itemCode as ItemCode;

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  const state = await getItemTimingState(sessionId, itemCode);
  if (!state) {
    res.status(404).json({ message: "Timing state not found" });
    return;
  }

  res.json(state);
});

executionRouter.get("/session/:sessionId/state", async (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  res.json(await listItemTimingStates(sessionId));
});

executionRouter.get("/session/:sessionId/runtime-state", async (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  const runtimeSession = await getRuntimeSession(sessionId);
  const recoveryStatus = await resolveRecoveryStatus(sessionId);

  const activeItemState = runtimeSession?.activeItemCode
    ? await getItemTimingState(sessionId, runtimeSession.activeItemCode)
    : undefined;

  const response: RuntimeSessionStateResponse = {
    sessionId,
    runtimeStatus: runtimeSession?.status ?? "IN_PROGRESS",
    recoveryStatus,
    activeItem: buildActiveItemMetadata(activeItemState ?? null),
  };

  res.json(response);
});

executionRouter.post("/session/:sessionId/item/:itemCode/start", async (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const itemCode = req.params.itemCode as ItemCode;

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  if (!(await findSessionById(sessionId))) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const config = getItemTimingConfig(itemCode);
  const state = await upsertItemTimingState({
    sessionId,
    itemCode,
    startedAt: new Date().toISOString(),
    durationSeconds: config.durationSeconds,
    silenceThresholdSeconds: config.silenceThresholdSeconds,
  });
  res.status(201).json(state);
});

executionRouter.post("/session/:sessionId/item/:itemCode/silence", async (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const itemCode = req.params.itemCode as ItemCode;
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

  const state = await getItemTimingState(sessionId, itemCode);
  if (!state || state.completed) {
    res.status(404).json({ message: "Active timing state not found" });
    return;
  }

  const currentSilenceCount = state.silenceEvents.length;
  if (body.level === 1 && currentSilenceCount >= 1) {
    res.json({
      state,
      avatarFeedback: buildSilenceFeedback(1),
    });
    return;
  }

  if (body.level === 2 && currentSilenceCount >= 2) {
    res.json({
      state,
      avatarFeedback: buildSilenceFeedback(2),
    });
    return;
  }

  const activeItemError = await assertActiveItem(sessionId, itemCode);
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

  const updatedState = await appendSilenceEvent({
    sessionId,
    itemCode,
    eventType: silenceLevel === 1 ? "FIRST_SILENCE" : "SECOND_SILENCE",
  });

  if (!updatedState) {
    res.status(404).json({ message: "Active timing state not found" });
    return;
  }

  res.json({
    state: updatedState,
    avatarFeedback: buildSilenceFeedback(silenceLevel),
  });
});

executionRouter.post("/session/:sessionId/item/:itemCode/complete", async (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const itemCode = req.params.itemCode as ItemCode;
  const body = req.body as FinalizeItemRequest;

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  if (!(await findSessionById(sessionId))) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const existingState = await getItemTimingState(sessionId, itemCode);
  if (existingState?.completed) {
    const runtimeSession = await getRuntimeSession(sessionId);
    const activeItemState = runtimeSession?.activeItemCode
      ? await getItemTimingState(sessionId, runtimeSession.activeItemCode)
      : null;

    const response: FinalizeItemResponse = {
      sessionId,
      completedItem: existingState,
      runtimeStatus: runtimeSession?.status ?? "IN_PROGRESS",
      activeItem: buildActiveItemMetadata(activeItemState ?? null),
    };

    res.json(response);
    return;
  }

  const activeItemError = await assertActiveItem(sessionId, itemCode);
  if (activeItemError) {
    res.status(409).json({ message: activeItemError });
    return;
  }

  // Resolve result payload outside the transaction (validation + position query)
  let resultPayload: { positionInSession: number; evaluatedOutcome: EvaluatedOutcome; data: unknown } | null = null;
  if (body.resultData !== undefined) {
    if (!isValidDataForItemCode(itemCode, body.resultData)) {
      res.status(400).json({ message: "resultData payload shape does not match itemCode" });
      return;
    }

    const evaluatedOutcome = resolveEvaluatedOutcome({
      itemCode,
      evaluatedOutcome: body.evaluatedOutcome ?? "NO_APLICA",
      data: body.resultData,
    });

    if (!evaluatedOutcome) {
      res.status(400).json({ message: "evaluatedOutcome is invalid for finalize-item" });
      return;
    }

    const positionInSession = await resolvePositionInSession(sessionId, itemCode, body.positionInSession);
    resultPayload = { positionInSession, evaluatedOutcome, data: body.resultData };
  }

  const nextItemCode = getNextItemCode(itemCode);
  const nextItem = nextItemCode
    ? {
        itemCode: nextItemCode,
        startedAt: new Date().toISOString(),
        durationSeconds: getItemTimingConfig(nextItemCode).durationSeconds,
        silenceThresholdSeconds: getItemTimingConfig(nextItemCode).silenceThresholdSeconds,
      }
    : null;

  let completedState: ItemTimingState;
  let nextItemState: ItemTimingState | null;
  try {
    ({ completedState, nextItemState } = await finalizeItemAtomic({
      sessionId,
      itemCode,
      result: resultPayload,
      nextItem,
    }));
  } catch {
    res.status(404).json({ message: "Item timing state not found" });
    return;
  }

  const response: FinalizeItemResponse = {
    sessionId,
    completedItem: completedState,
    runtimeStatus: nextItemCode ? "IN_PROGRESS" : "COMPLETED",
    activeItem: buildActiveItemMetadata(nextItemState),
  };

  res.json(response);
});
