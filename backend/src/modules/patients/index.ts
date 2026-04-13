import { Request, Response, Router } from "express";
import {
  createPatient,
  deletePatient,
  findPatientById,
  listPatients,
  updatePatient,
} from "../../shared/persistence/patients.repository";
import { countByPatientId, countOpenByPatientId } from "../../shared/persistence/sessions.repository";

export const patientsRouter = Router();

function parseId(value: string): number {
  return Number(value);
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
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

async function handlePatientUpdate(req: Request, res: Response) {
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
  const hasFullName = typeof body.fullName === "string";
  const hasBirthDate = typeof body.birthDate === "string";

  if (!hasFullName && !hasBirthDate) {
    res.status(400).json({ message: "At least one of fullName or birthDate is required" });
    return;
  }

  const fullName = hasFullName ? String(body.fullName).trim() : undefined;
  const birthDate = hasBirthDate ? String(body.birthDate).trim() : undefined;

  if (hasFullName && !fullName) {
    res.status(400).json({ message: "fullName cannot be empty" });
    return;
  }

  if (birthDate && !isValidIsoDate(birthDate)) {
    res.status(400).json({ message: "birthDate must be a valid ISO date (YYYY-MM-DD)" });
    return;
  }

  const patient = await updatePatient(id, {
    fullName,
    birthDate,
    sex: typeof body.sex === "string" ? body.sex : undefined,
    internalCode: typeof body.internalCode === "string" ? body.internalCode : undefined,
    active: typeof body.active === "boolean" ? body.active : undefined,
  });

  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  res.json(patient);
}

patientsRouter.patch("/:id", handlePatientUpdate);
patientsRouter.put("/:id", handlePatientUpdate);

patientsRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid patient id" });
    return;
  }

  const existingPatient = await findPatientById(id);
  if (!existingPatient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  try {
    const openSessions = await countOpenByPatientId(id);
    if (openSessions > 0) {
      res.status(409).json({ message: "Cannot delete patient with active sessions" });
      return;
    }

    const totalSessions = await countByPatientId(id);
    if (totalSessions > 0) {
      res.status(409).json({ message: "Cannot delete patient with existing sessions" });
      return;
    }

    await deletePatient(id);
    res.status(204).send();
  } catch (_error) {
    res.status(500).json({ message: "Failed to delete patient" });
  }
});
