import { PatientsService } from "./patients.service";
import type { CreatePatientDto } from "./patients.types";

export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  list() {
    return this.patientsService.list();
  }

  create(input: CreatePatientDto) {
    return this.patientsService.create(input);
  }
}
