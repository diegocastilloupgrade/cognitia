"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executionRouter = void 0;
const express_1 = require("express");
exports.executionRouter = (0, express_1.Router)();
exports.executionRouter.get("/runtime", (_req, res) => {
    res.json({ status: "idle" });
});
