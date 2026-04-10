"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockUnithClient = void 0;
class MockUnithClient {
    async sendSession(payload) {
        return {
            accepted: true,
            message: `Mock sendSession accepted for ${payload.externalSessionId}`,
        };
    }
    async sendResult(payload) {
        return {
            accepted: true,
            message: `Mock sendResult accepted for ${payload.externalSessionId}`,
        };
    }
}
exports.MockUnithClient = MockUnithClient;
