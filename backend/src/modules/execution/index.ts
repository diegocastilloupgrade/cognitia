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
import { readStoreState, updateStoreState } from "../../shared/persistence/app-store";
import type { ScreeningSession } from "../sessions/sessions.types";
import {
  isValidDataForItemCode,
  listResultsBySessionId,
  persistResult,
  resolveEvaluatedOutcome,
} from "../results/results.store";

export const executionRouter = Router();

function parseSessionId(value: string): number {
  return Number(value);
}

function findSession(sessionId: number): ScreeningSession | undefined {
  return readStoreState().sessions.find((session) => session.id === sessionId);
}

function findRuntimeSession(sessionId: number): RuntimeSessionState | undefined {
  return readStoreState().runtimeSessions.find((session) => session.sessionId === sessionId);
}

function listItemTimingStatesBySessionId(sessionId: number): ItemTimingState[] {
  return findRuntimeSession(sessionId)?.itemTimingStates ?? [];
}

function findItemTimingState(sessionId: number, itemCode: ItemCode): ItemTimingState | undefined {
  const session = findRuntimeSession(sessionId);
  return session?.itemTimingStates.find((state) => state.itemCode === itemCode);
}

function getOrCreateRuntimeSession(sessionId: number): RuntimeSessionState {
  return updateStoreState((store) => {
    const existing = store.runtimeSessions.find((session) => session.sessionId === sessionId);
    if (existing) {
      return existing;
    }

    const state: RuntimeSessionState = {
      sessionId,
      status: "IN_PROGRESS",
      activeItemCode: null,
      itemTimingStates: [],
    };

    store.runtimeSessions.push(state);
    return state;
  });
}

function upsertItemTimingState(sessionId: number, itemCode: ItemCode): ItemTimingState {
  return updateStoreState((store) => {
    let session = store.runtimeSessions.find((item) => item.sessionId === sessionId);
    if (!session) {
      session = {
        sessionId,
        status: "IN_PROGRESS",
        activeItemCode: null,
        itemTimingStates: [],
      };
      store.runtimeSessions.push(session);
    }

    const existing = session.itemTimingStates.find((item) => item.itemCode === itemCode);
    if (existing && !existing.completed && session.activeItemCode === itemCode) {
      return existing;
    }

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
  });
}

function markItemCompleted(sessionId: number, itemCode: ItemCode): ItemTimingState | undefined {
  return updateStoreState((store) => {
    const session = store.runtimeSessions.find((item) => item.sessionId === sessionId);
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
  });
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

function resolvePositionInSession(sessionId: number, itemCode: ItemCode, requestedPosition?: number): number {
  if (typeof requestedPosition === "number" && requestedPosition > 0) {
    return requestedPosition;
  }

  const existingResults = listResultsBySessionId(sessionId);
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

function persistFinalizeResult(input: {
  sessionId: number;
  itemCode: ItemCode;
  requestedPosition?: number;
  requestedOutcome?: EvaluatedOutcome;
  resultData: unknown;
}): { ok: true } | { ok: false; status: number; message: string } {
  if (!isValidDataForItemCode(input.itemCode, input.resultData)) {
    return { ok: false, status: 400, message: "resultData payload shape does not match itemCode" };
  }

  const evaluatedOutcome = resolveEvaluatedOutcome({
    itemCode: input.itemCode,
    evaluatedOutcome: input.requestedOutcome ?? "NO_APLICA",
    data: input.resultData,
  });

  if (!evaluatedOutcome) {
    return { ok: false, status: 400, message: "evaluatedOutcome is invalid for finalize-item" };
  }

  persistResult({
    sessionId: input.sessionId,
    itemCode: input.itemCode,
    positionInSession: resolvePositionInSession(input.sessionId, input.itemCode, input.requestedPosition),
    evaluatedOutcome,
    data: input.resultData,
  });

  return { ok: true };
}

function assertActiveItem(sessionId: number, itemCode: ItemCode): string | null {
  const session = findRuntimeSession(sessionId);
  if (!session) {
    return "Active runtime session not found";
  }

  if (session.activeItemCode !== itemCode) {
    return `Runtime event rejected for item ${itemCode}; active item is ${session.activeItemCode ?? "none"}`;
  }

  return null;
}

function resolveRecoveryStatus(sessionId: number): RuntimeSessionStateResponse["recoveryStatus"] {
  const session = findSession(sessionId);
  const runtimeSession = findRuntimeSession(sessionId);

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

export function initializeRuntimeSession(sessionId: number): RuntimeSessionState {
  const existing = findRuntimeSession(sessionId);
  if (existing?.activeItemCode || existing?.status === "COMPLETED") {
    return existing;
  }

  const firstItemCode = ITEM_TIMING_CONFIGS[0]?.itemCode ?? getItemTimingConfig("3.1").itemCode;
  upsertItemTimingState(sessionId, firstItemCode);

  return findRuntimeSession(sessionId) as RuntimeSessionState;
}

executionRouter.get("/runtime", (_req, res) => {
  const store = readStoreState();
  res.json({
    status: "ready",
    activeSessions: store.runtimeSessions.filter((session) => session.status === "IN_PROGRESS").length,
  });
});

executionRouter.get("/session/:sessionId/item/:itemCode/state", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const itemCode = req.params.itemCode as ItemCode;

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

executionRouter.get("/session/:sessionId/runtime-state", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  const runtimeSession = findRuntimeSession(sessionId);
  const recoveryStatus = resolveRecoveryStatus(sessionId);

  const activeItemState = runtimeSession?.activeItemCode
    ? findItemTimingState(sessionId, runtimeSession.activeItemCode)
    : undefined;

  const response: RuntimeSessionStateResponse = {
    sessionId,
    runtimeStatus: runtimeSession?.status ?? "IN_PROGRESS",
    recoveryStatus,
    activeItem: buildActiveItemMetadata(activeItemState ?? null),
  };

  res.json(response);
});

executionRouter.post("/session/:sessionId/item/:itemCode/start", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const itemCode = req.params.itemCode as ItemCode;

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  if (!findSession(sessionId)) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const state = upsertItemTimingState(sessionId, itemCode);
  res.status(201).json(state);
});

executionRouter.post("/session/:sessionId/item/:itemCode/silence", (req, res) => {
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

  const state = findItemTimingState(sessionId, itemCode);
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

  const updatedState = updateStoreState((store) => {
    const runtimeSession = store.runtimeSessions.find((item) => item.sessionId === sessionId);
    const persistedState = runtimeSession?.itemTimingStates.find((item) => item.itemCode === itemCode);
    if (!persistedState) {
      return undefined;
    }

    persistedState.silenceEvents.push({
      occurredAt: new Date().toISOString(),
      type: silenceLevel === 1 ? "FIRST_SILENCE" : "SECOND_SILENCE",
    });

    return persistedState;
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

executionRouter.post("/session/:sessionId/item/:itemCode/complete", (req, res) => {
  const sessionId = parseSessionId(req.params.sessionId);
  const itemCode = req.params.itemCode as ItemCode;
  const body = req.body as FinalizeItemRequest;

  if (Number.isNaN(sessionId)) {
    res.status(400).json({ message: "Invalid sessionId" });
    return;
  }

  if (!findSession(sessionId)) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const existingState = findItemTimingState(sessionId, itemCode);
  if (existingState?.completed) {
    const runtimeSession = findRuntimeSession(sessionId);
    const activeItemState = runtimeSession?.activeItemCode
      ? findItemTimingState(sessionId, runtimeSession.activeItemCode)
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

  const activeItemError = assertActiveItem(sessionId, itemCode);
  if (activeItemError) {
    res.status(409).json({ message: activeItemError });
    return;
  }

  if (body.resultData !== undefined) {
    const persistedResult = persistFinalizeResult({
      sessionId,
      itemCode,
      requestedPosition: body.positionInSession,
      requestedOutcome: body.evaluatedOutcome,
      resultData: body.resultData,
    });

    if (!persistedResult.ok) {
      res.status(persistedResult.status).json({ message: persistedResult.message });
      return;
    }
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
    updateStoreState((store) => {
      const persistedRuntime = store.runtimeSessions.find((item) => item.sessionId === sessionId);
      if (persistedRuntime) {
        persistedRuntime.status = "COMPLETED";
        persistedRuntime.activeItemCode = null;
      }

      const persistedSession = store.sessions.find((item) => item.id === sessionId);
      if (persistedSession && persistedSession.status === "EN_EJECUCION") {
        persistedSession.status = "COMPLETADA";
        if (!persistedSession.finishedAt) {
          persistedSession.finishedAt = new Date().toISOString();
        }
      }
    });
  }

  const response: FinalizeItemResponse = {
    sessionId,
    completedItem: state,
    runtimeStatus: nextItemCode ? "IN_PROGRESS" : "COMPLETED",
    activeItem: buildActiveItemMetadata(activeItemState),
  };

  res.json(response);
});
