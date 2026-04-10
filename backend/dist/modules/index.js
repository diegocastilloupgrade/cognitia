"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const auth_1 = require("./auth");
const execution_1 = require("./execution");
const patients_1 = require("./patients");
const results_1 = require("./results");
const sessions_1 = require("./sessions");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
exports.apiRouter.use("/auth", auth_1.authRouter);
exports.apiRouter.use("/patients", patients_1.patientsRouter);
exports.apiRouter.use("/sessions", sessions_1.sessionsRouter);
exports.apiRouter.use("/results", results_1.resultsRouter);
exports.apiRouter.use("/execution", execution_1.executionRouter);
