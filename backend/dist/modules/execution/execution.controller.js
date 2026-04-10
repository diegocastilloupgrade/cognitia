"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionController = void 0;
class ExecutionController {
    constructor(executionService) {
        this.executionService = executionService;
    }
    list() {
        return this.executionService.list();
    }
    start(input) {
        return this.executionService.start(input);
    }
}
exports.ExecutionController = ExecutionController;
