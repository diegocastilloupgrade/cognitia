import { getPostgresPool } from "../db/postgres";
import type { CreatePatientDto, Patient } from "../../modules/patients/patients.types";

function mapPatient(row: Record<string, unknown>): Patient {
  return {
    id: Number(row.id),
    fullName: String(row.full_name),
    birthDate: String(row.birth_date),
    sex: typeof row.sex === "string" ? row.sex : undefined,
    internalCode: typeof row.internal_code === "string" ? row.internal_code : undefined,
    active: Boolean(row.active),
  };
}

export async function listPatients(): Promise<Patient[]> {
  const result = await getPostgresPool().query(
    `SELECT id::int AS id, full_name, birth_date::text AS birth_date, sex, internal_code, active
     FROM patients
     ORDER BY id ASC`,
  );

  return result.rows.map((row) => mapPatient(row as Record<string, unknown>));
}

export async function createPatient(input: CreatePatientDto): Promise<Patient> {
  const result = await getPostgresPool().query(
    `INSERT INTO patients (full_name, birth_date, sex, internal_code, active)
     VALUES ($1, $2::date, $3, $4, $5)
     RETURNING id::int AS id, full_name, birth_date::text AS birth_date, sex, internal_code, active`,
    [input.fullName, input.birthDate, input.sex ?? null, input.internalCode ?? null, input.active ?? true],
  );

  return mapPatient(result.rows[0] as Record<string, unknown>);
}

export async function findPatientById(id: number): Promise<Patient | null> {
  const result = await getPostgresPool().query(
    `SELECT id::int AS id, full_name, birth_date::text AS birth_date, sex, internal_code, active
     FROM patients
     WHERE id = $1`,
    [id],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapPatient(result.rows[0] as Record<string, unknown>);
}

export async function updatePatient(id: number, updates: Partial<CreatePatientDto> & { active?: boolean }): Promise<Patient | null> {
  const result = await getPostgresPool().query(
    `UPDATE patients
       SET full_name = COALESCE($2, full_name),
           birth_date = COALESCE($3::date, birth_date),
           sex = COALESCE($4, sex),
           internal_code = COALESCE($5, internal_code),
           active = COALESCE($6, active)
     WHERE id = $1
     RETURNING id::int AS id, full_name, birth_date::text AS birth_date, sex, internal_code, active`,
    [
      id,
      updates.fullName ?? null,
      updates.birthDate ?? null,
      updates.sex ?? null,
      updates.internalCode ?? null,
      typeof updates.active === "boolean" ? updates.active : null,
    ],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapPatient(result.rows[0] as Record<string, unknown>);
}

export async function deactivatePatient(id: number): Promise<Patient | null> {
  const result = await getPostgresPool().query(
    `UPDATE patients
       SET active = FALSE
     WHERE id = $1
     RETURNING id::int AS id, full_name, birth_date::text AS birth_date, sex, internal_code, active`,
    [id],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapPatient(result.rows[0] as Record<string, unknown>);
}
