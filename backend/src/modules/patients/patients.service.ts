import type { CreatePatientInput, Patient } from "./patients.types";

export class PatientsService {
  private readonly patients: Patient[] = [];

  list(): Patient[] {
    return this.patients;
  }

  create(input: CreatePatientInput): Patient {
    const patient: Patient = {
      id: `patient-${this.patients.length + 1}`,
      ...input,
    };

    this.patients.push(patient);
    return patient;
  }
}
