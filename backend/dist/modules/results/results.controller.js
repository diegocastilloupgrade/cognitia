"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsController = void 0;
class ResultsController {
    constructor(resultsService) {
        this.resultsService = resultsService;
    }
    listBySession(sessionId) {
        return this.resultsService.listBySession(sessionId);
    }
    create(input) {
        return this.resultsService.create(input);
    }
}
exports.ResultsController = ResultsController;
