"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsController = void 0;
class SessionsController {
    constructor(sessionsService) {
        this.sessionsService = sessionsService;
    }
    list() {
        return this.sessionsService.list();
    }
    create(input) {
        return this.sessionsService.create(input);
    }
}
exports.SessionsController = SessionsController;
