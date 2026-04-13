import { Router } from "express";
import type { CreateSessionDto, ScreeningSession } from "./sessions.types";
import { initializeRuntimeSession } from "../execution";
import {
  completeSession,
  createSessionIfNoOpen,
  findSessionById,
  listSessions,
  startSession,
} from "../../shared/persistence/sessions.repository";
import { completeRuntimeSession } from "../../shared/persistence/runtime.repository";

export const sessionsRouter = Router();

function parseId(value: string): number {
  return Number(value);
}

sessionsRouter.get("/", async (_req, res) => {
  res.json(await listSessions());
});

sessionsRouter.post("/", async (req, res) => {
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

  const session: ScreeningSession | null = await createSessionIfNoOpen({
    patientId: body.patientId,
    createdByUserId: body.createdByUserId,
  });

  if (!session) {
    res.status(409).json({ message: "Patient already has an open session" });
    return;
  }

  res.status(201).json(session);
});

sessionsRouter.post("/:id/start", async (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid session id" });
    return;
  }

  const session = await findSessionById(id);
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

  const startedSession = await startSession(id);

  if (!startedSession) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  await initializeRuntimeSession(id);

  res.json(startedSession);
});

sessionsRouter.post("/:id/complete", async (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid session id" });
    return;
  }

  const session = await findSessionById(id);
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

  const completedSession = await completeSession(id);

  if (!completedSession) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  await completeRuntimeSession(id);

  res.json(completedSession);
});

sessionsRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid session id" });
    return;
  }

  const session = await findSessionById(id);
  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  res.json(session);
});
