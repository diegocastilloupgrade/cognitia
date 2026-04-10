"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resultsRouter = void 0;
const express_1 = require("express");
exports.resultsRouter = (0, express_1.Router)();
const sessionResults = [];
let nextResultId = 1;
function parseSessionId(value) {
    return Number(value);
}
function isEvaluatedOutcome(value) {
    return (value === "ACIERTO" ||
        value === "ERROR" ||
        value === "OMISION" ||
        value === "NO_APLICA");
}
function isItemResultData3_1(value) {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const candidate = value;
    return (typeof candidate.stimulusId === "string" &&
        typeof candidate.recognizedText === "string" &&
        typeof candidate.isCorrect === "boolean");
}
function resolveEvaluatedOutcome(input) {
    if (input.itemCode === "3.1" && isItemResultData3_1(input.data)) {
        return input.data.isCorrect ? "ACIERTO" : "ERROR";
    }
    if (isEvaluatedOutcome(input.evaluatedOutcome)) {
        return input.evaluatedOutcome;
    }
    return undefined;
}
function addResult(input) {
    const result = {
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
function listBySessionId(sessionId) {
    return sessionResults.filter((item) => item.sessionId === sessionId);
}
exports.resultsRouter.get("/session/:sessionId", (req, res) => {
    const sessionId = parseSessionId(req.params.sessionId);
    if (Number.isNaN(sessionId)) {
        res.status(400).json({ message: "Invalid sessionId" });
        return;
    }
    res.json(listBySessionId(sessionId));
});
exports.resultsRouter.post("/session/:sessionId", (req, res) => {
    const sessionId = parseSessionId(req.params.sessionId);
    if (Number.isNaN(sessionId)) {
        res.status(400).json({ message: "Invalid sessionId" });
        return;
    }
    const body = req.body;
    const evaluatedOutcome = resolveEvaluatedOutcome({
        itemCode: body.itemCode,
        evaluatedOutcome: body.evaluatedOutcome,
        data: body.data,
    });
    if (typeof body.itemCode !== "string" ||
        typeof body.positionInSession !== "number" ||
        !evaluatedOutcome) {
        res.status(400).json({
            message: "itemCode, positionInSession and evaluatedOutcome are required with valid types",
        });
        return;
    }
    const created = addResult({
        sessionId,
        itemCode: body.itemCode,
        positionInSession: body.positionInSession,
        evaluatedOutcome,
        data: body.data,
    });
    res.status(201).json(created);
});
