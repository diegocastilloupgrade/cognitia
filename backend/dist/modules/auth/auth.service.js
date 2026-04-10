"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
class AuthService {
    login(input) {
        return {
            accessToken: `mock-token-for-${input.email}`,
            expiresInSeconds: 3600,
        };
    }
    me() {
        return {
            id: "user-1",
            email: "demo@cognitia.local",
            role: "clinician",
        };
    }
}
exports.AuthService = AuthService;
