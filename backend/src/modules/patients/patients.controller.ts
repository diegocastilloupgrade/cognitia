import { PatientsService } from "./patients.service";
import type { CreatePatientInput } from "./patients.types";

export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  list() {
    return this.patientsService.list();
  }

  create(input: CreatePatientInput) {
    return this.patientsService.create(input);
  }
}
