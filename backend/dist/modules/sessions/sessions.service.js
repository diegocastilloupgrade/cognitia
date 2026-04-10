"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
class SessionsService {
    constructor() {
        this.sessions = [];
        this.nextId = 1;
    }
    list() {
        return this.sessions;
    }
    create(input) {
        const session = {
            id: this.nextId++,
            patientId: input.patientId,
            createdByUserId: input.createdByUserId,
            status: "BORRADOR",
        };
        this.sessions.push(session);
        return session;
    }
}
exports.SessionsService = SessionsService;
