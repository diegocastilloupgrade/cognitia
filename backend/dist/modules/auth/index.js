"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/login", (_req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
});
