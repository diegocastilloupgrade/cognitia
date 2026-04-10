"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsRouter = void 0;
const express_1 = require("express");
exports.sessionsRouter = (0, express_1.Router)();
const sessions = [];
let nextSessionId = 1;
function parseId(value) {
    return Number(value);
}
exports.sessionsRouter.get("/", (_req, res) => {
    res.json(sessions);
});
exports.sessionsRouter.post("/", (req, res) => {
    const body = req.body;
    if (typeof body.patientId !== "number" ||
        typeof body.createdByUserId !== "number") {
        res.status(400).json({
            message: "patientId and createdByUserId are required numbers",
        });
        return;
    }
    const hasActiveSession = sessions.some((session) => session.patientId === body.patientId &&
        (session.status === "BORRADOR" || session.status === "EN_EJECUCION"));
    if (hasActiveSession) {
        res.status(409).json({
            message: "Patient already has an active session in BORRADOR or EN_EJECUCION",
        });
        return;
    }
    const session = {
        id: nextSessionId++,
        patientId: body.patientId,
        createdByUserId: body.createdByUserId,
        status: "BORRADOR",
    };
    sessions.push(session);
    res.status(201).json(session);
});
exports.sessionsRouter.post("/:id/start", (req, res) => {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ message: "Invalid session id" });
        return;
    }
    const session = sessions.find((item) => item.id === id);
    if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
    }
    if (session.status !== "BORRADOR") {
        res.status(409).json({
            message: "Session can only be started from BORRADOR status",
        });
        return;
    }
    session.status = "EN_EJECUCION";
    if (!session.startedAt) {
        session.startedAt = new Date().toISOString();
    }
    res.json(session);
});
exports.sessionsRouter.post("/:id/complete", (req, res) => {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ message: "Invalid session id" });
        return;
    }
    const session = sessions.find((item) => item.id === id);
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
    session.status = "COMPLETADA";
    if (!session.finishedAt) {
        session.finishedAt = new Date().toISOString();
    }
    res.json(session);
});
exports.sessionsRouter.get("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ message: "Invalid session id" });
        return;
    }
    const session = sessions.find((item) => item.id === id);
    if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
    }
    res.json(session);
});
