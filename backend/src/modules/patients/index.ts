import { PatientsController } from "./patients.controller";
import { PatientsService } from "./patients.service";

export function createPatientsModule() {
  const service = new PatientsService();
  const controller = new PatientsController(service);

  return {
    name: "patients",
    service,
    controller,
  };
}

export type PatientsModule = ReturnType<typeof createPatientsModule>;
