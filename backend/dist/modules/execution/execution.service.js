"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionService = void 0;
class ExecutionService {
    constructor() {
        this.tasks = [];
    }
    list() {
        return this.tasks;
    }
    start(input) {
        const task = {
            id: `execution-${this.tasks.length + 1}`,
            sessionId: input.sessionId,
            status: "pending",
        };
        this.tasks.push(task);
        return task;
    }
}
exports.ExecutionService = ExecutionService;
