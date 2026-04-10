"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsService = void 0;
class PatientsService {
    constructor() {
        this.patients = [];
        this.nextId = 1;
    }
    list() {
        return this.patients;
    }
    create(input) {
        const patient = {
            id: this.nextId++,
            fullName: input.fullName,
            birthDate: input.birthDate,
            sex: input.sex,
            internalCode: input.internalCode,
            active: input.active ?? true,
        };
        this.patients.push(patient);
        return patient;
    }
}
exports.PatientsService = PatientsService;
