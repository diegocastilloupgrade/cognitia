"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    login(input) {
        return this.authService.login(input);
    }
    me() {
        return this.authService.me();
    }
}
exports.AuthController = AuthController;
