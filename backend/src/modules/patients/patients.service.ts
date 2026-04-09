import type { CreatePatientInput, Patient } from "./patients.types";

export class PatientsService {
  private readonly patients: Patient[] = [];
  private nextId = 1;

  list(): Patient[] {
    return this.patients;
  }

  create(input: CreatePatientInput): Patient {
    const patient: Patient = {
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
