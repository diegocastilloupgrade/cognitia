import { Router } from "express";
import {
  createPatient,
  deactivatePatient,
  findPatientById,
  listPatients,
  updatePatient,
} from "../../shared/persistence/patients.repository";

export const patientsRouter = Router();

function parseId(value: string): number {
  return Number(value);
}

patientsRouter.get("/", async (_req, res) => {
  const patients = await listPatients();
  res.json(patients);
});

patientsRouter.post("/", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const fullName =
    typeof body.fullName === "string"
      ? body.fullName.trim()
      : typeof body.name === "string"
      ? body.name.trim()
      : "";
  const birthDate =
    typeof body.birthDate === "string" ? body.birthDate.trim() : "";

  if (!fullName || !birthDate) {
    res.status(400).json({
      message: "fullName (or name) and birthDate are required",
    });
    return;
  }

  const patient = await createPatient({
    fullName,
    birthDate,
    sex: typeof body.sex === "string" ? body.sex : undefined,
    internalCode:
      typeof body.internalCode === "string" ? body.internalCode : undefined,
    active: true,
  });

  res.status(201).json(patient);
});

patientsRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid patient id" });
    return;
  }

  const patient = await findPatientById(id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  res.json(patient);
});

patientsRouter.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid patient id" });
    return;
  }

  const current = await findPatientById(id);
  if (!current) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const patient = await updatePatient(id, {
    fullName: typeof body.fullName === "string" && body.fullName.trim() ? body.fullName.trim() : undefined,
    birthDate: typeof body.birthDate === "string" && body.birthDate.trim() ? body.birthDate.trim() : undefined,
    sex: typeof body.sex === "string" ? body.sex : undefined,
    internalCode: typeof body.internalCode === "string" ? body.internalCode : undefined,
    active: typeof body.active === "boolean" ? body.active : undefined,
  });

  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  res.json(patient);
});

patientsRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid patient id" });
    return;
  }

  const patient = await deactivatePatient(id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  res.json(patient);
});
