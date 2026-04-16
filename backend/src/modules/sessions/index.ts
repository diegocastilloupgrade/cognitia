import { Router } from "express";
import type { CreateSessionDto, ScreeningSession } from "./sessions.types";
import { initializeRuntimeSession } from "../execution";
import { listResultsBySessionId } from "../results/results.store";
import { validateCompleteTransition, validateStartTransition } from "./state-validation";
import {
  completeSession,
  createSessionIfNoOpen,
  findSessionById,
  listSessions,
  startSession,
  updateDraftSession,
} from "../../shared/persistence/sessions.repository";
import { deleteSession } from "../../shared/persistence/sessions.repository";
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

  const startValidation = validateStartTransition(session);
  if (!startValidation.valid) {
    res.status(400).json({ message: startValidation.message });
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

  const results = await listResultsBySessionId(id);
  const completeValidation = validateCompleteTransition(session, results.length);
  if (!completeValidation.valid) {
    res.status(400).json({ message: completeValidation.message });
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

sessionsRouter.delete("/:id", async (req, res) => {
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

  if (session.status === "EN_EJECUCION" || session.status === "COMPLETADA") {
    res.status(409).json({
      message: "Cannot delete sessions in EN_EJECUCION or COMPLETADA status",
    });
    return;
  }

  await deleteSession(id);
  res.status(204).send();
});

sessionsRouter.patch("/:id", async (req, res) => {
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

  const body = req.body as Partial<{ patientId: number; createdByUserId: number; notes: string }>;

  if (session.status === "COMPLETADA") {
    res.status(403).json({ message: "Cannot edit completed session" });
    return;
  }

  if (session.status === "EN_EJECUCION") {
    const keys = Object.keys(body);
    const invalidKeys = keys.filter((k) => k !== "notes");
    if (invalidKeys.length > 0) {
      res.status(400).json({ message: "Cannot modify session details while in execution" });
      return;
    }

    // Notes are not persisted in v1; return current session for compatibility.
    res.json(session);
    return;
  }

  const updated = await updateDraftSession(id, {
    patientId: typeof body.patientId === "number" ? body.patientId : undefined,
    createdByUserId: typeof body.createdByUserId === "number" ? body.createdByUserId : undefined,
  });

  if (!updated) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  res.json(updated);
});
