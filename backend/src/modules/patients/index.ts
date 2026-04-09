import { Router } from "express";
import type { Patient } from "./patients.types";

export const patientsRouter = Router();

const patients: Patient[] = [];
let nextPatientId = 1;

function parseId(value: string): number {
  return Number(value);
}

patientsRouter.get("/", (_req, res) => {
  res.json(patients);
});

patientsRouter.post("/", (req, res) => {
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

  const patient: Patient = {
    id: nextPatientId++,
    fullName,
    birthDate,
    sex: typeof body.sex === "string" ? body.sex : undefined,
    internalCode:
      typeof body.internalCode === "string" ? body.internalCode : undefined,
    active: true,
  };

  patients.push(patient);
  res.status(201).json(patient);
});

patientsRouter.get("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid patient id" });
    return;
  }

  const patient = patients.find((item) => item.id === id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  res.json(patient);
});

patientsRouter.put("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid patient id" });
    return;
  }

  const patient = patients.find((item) => item.id === id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  if (typeof body.fullName === "string" && body.fullName.trim()) {
    patient.fullName = body.fullName.trim();
  }
  if (typeof body.birthDate === "string" && body.birthDate.trim()) {
    patient.birthDate = body.birthDate.trim();
  }
  if (typeof body.sex === "string") {
    patient.sex = body.sex;
  }
  if (typeof body.internalCode === "string") {
    patient.internalCode = body.internalCode;
  }
  if (typeof body.active === "boolean") {
    patient.active = body.active;
  }

  res.json(patient);
});

patientsRouter.delete("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid patient id" });
    return;
  }

  const patient = patients.find((item) => item.id === id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  patient.active = false;
  res.json(patient);
});
