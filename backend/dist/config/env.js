"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
function loadEnv() {
    const port = Number(process.env.PORT ?? 3000);
    return {
        nodeEnv: process.env.NODE_ENV ?? "development",
        port: Number.isNaN(port) ? 3000 : port,
    };
}
