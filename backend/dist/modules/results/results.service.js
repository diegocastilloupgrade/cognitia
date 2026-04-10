"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsService = void 0;
class ResultsService {
    constructor() {
        this.results = [];
        this.nextId = 1;
    }
    listBySession(sessionId) {
        return this.results.filter((item) => item.sessionId === sessionId);
    }
    create(input) {
        const result = {
            id: this.nextId++,
            sessionId: input.sessionId,
            itemCode: input.itemCode,
            positionInSession: input.positionInSession,
            evaluatedOutcome: input.evaluatedOutcome,
            data: input.data,
            createdAt: new Date().toISOString(),
        };
        this.results.push(result);
        return result;
    }
}
exports.ResultsService = ResultsService;
