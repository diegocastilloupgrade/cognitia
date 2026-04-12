import { Router } from "express";
import type { CreateSessionDto, ScreeningSession } from "./sessions.types";
import { readStoreState, updateStoreState } from "../../shared/persistence/app-store";
import { initializeRuntimeSession } from "../execution";

export const sessionsRouter = Router();

function parseId(value: string): number {
  return Number(value);
}

sessionsRouter.get("/", (_req, res) => {
  res.json(readStoreState().sessions);
});

sessionsRouter.post("/", (req, res) => {
  const body = req.body as Partial<CreateSessionDto>;
  if (
    typeof body.patientId !== "number" ||
    typeof body.createdByUserId !== "number"
  ) {
    res.status(400).json({
      message: "patientId and createdByUserId are required numbers",
    });
    return;
  }

  const hasActiveSession = readStoreState().sessions.some(
    (session) =>
      session.patientId === body.patientId &&
      (session.status === "BORRADOR" || session.status === "EN_EJECUCION")
  );

  if (hasActiveSession) {
    res.status(409).json({
      message:
        "Patient already has an active session in BORRADOR or EN_EJECUCION",
    });
    return;
  }

  const session = updateStoreState((store) => {
    const nextSession: ScreeningSession = {
      id: store.counters.nextSessionId++,
      patientId: body.patientId as number,
      createdByUserId: body.createdByUserId as number,
      status: "BORRADOR",
    };

    store.sessions.push(nextSession);
    return nextSession;
  });

  res.status(201).json(session);
});

sessionsRouter.post("/:id/start", (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid session id" });
    return;
  }

  const existingSession = readStoreState().sessions.find((item) => item.id === id);
  const session = existingSession ? { ...existingSession } : undefined;
  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  if (session.status === "EN_EJECUCION") {
    res.json(session);
    return;
  }

  if (session.status !== "BORRADOR") {
    res.status(409).json({
      message: "Session can only be started from BORRADOR status",
    });
    return;
  }

  const startedSession = updateStoreState((store) => {
    const persisted = store.sessions.find((item) => item.id === id);
    if (!persisted) {
      return undefined;
    }

    persisted.status = "EN_EJECUCION";
    if (!persisted.startedAt) {
      persisted.startedAt = new Date().toISOString();
    }

    return { ...persisted };
  });

  if (!startedSession) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  initializeRuntimeSession(id);

  res.json(startedSession);
});

sessionsRouter.post("/:id/complete", (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid session id" });
    return;
  }

  const session = readStoreState().sessions.find((item) => item.id === id);
  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  if (session.status !== "EN_EJECUCION") {
    res.status(409).json({
      message: "Session can only be completed from EN_EJECUCION status",
    });
    return;
  }

  const completedSession = updateStoreState((store) => {
    const persisted = store.sessions.find((item) => item.id === id);
    if (!persisted) {
      return undefined;
    }

    persisted.status = "COMPLETADA";
    if (!persisted.finishedAt) {
      persisted.finishedAt = new Date().toISOString();
    }

    const runtime = store.runtimeSessions.find((item) => item.sessionId === id);
    if (runtime) {
      runtime.status = "COMPLETED";
      runtime.activeItemCode = null;
    }

    return { ...persisted };
  });

  if (!completedSession) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  res.json(completedSession);
});

sessionsRouter.get("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid session id" });
    return;
  }

  const session = readStoreState().sessions.find((item) => item.id === id);
  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  res.json(session);
});
