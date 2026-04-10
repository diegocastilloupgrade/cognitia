"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = logInfo;
function logInfo(message, payload) {
    if (payload === undefined) {
        console.log(`[INFO] ${message}`);
        return;
    }
    console.log(`[INFO] ${message}`, payload);
}
