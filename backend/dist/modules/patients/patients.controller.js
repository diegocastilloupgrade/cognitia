"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsController = void 0;
class PatientsController {
    constructor(patientsService) {
        this.patientsService = patientsService;
    }
    list() {
        return this.patientsService.list();
    }
    create(input) {
        return this.patientsService.create(input);
    }
}
exports.PatientsController = PatientsController;
