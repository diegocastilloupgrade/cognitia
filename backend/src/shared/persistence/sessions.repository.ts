import { getPostgresPool } from "../db/postgres";
import type { CreateSessionDto, ScreeningSession } from "../../modules/sessions/sessions.types";

function mapSession(row: Record<string, unknown>): ScreeningSession {
  return {
    id: Number(row.id),
    patientId: Number(row.patient_id),
    createdByUserId: Number(row.created_by_user_id),
    status: row.status as ScreeningSession["status"],
    startedAt: typeof row.started_at === "string" ? row.started_at : undefined,
    finishedAt: typeof row.finished_at === "string" ? row.finished_at : undefined,
  };
}

export async function listSessions(): Promise<ScreeningSession[]> {
  const result = await getPostgresPool().query(
    `SELECT id::int AS id, patient_id::int AS patient_id, created_by_user_id, status,
            started_at::text AS started_at, finished_at::text AS finished_at
     FROM sessions
     ORDER BY id ASC`,
  );

  return result.rows.map((row) => mapSession(row as Record<string, unknown>));
}

export async function findSessionById(id: number): Promise<ScreeningSession | null> {
  const result = await getPostgresPool().query(
    `SELECT id::int AS id, patient_id::int AS patient_id, created_by_user_id, status,
            started_at::text AS started_at, finished_at::text AS finished_at
     FROM sessions
     WHERE id = $1`,
    [id],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapSession(result.rows[0] as Record<string, unknown>);
}

export async function patientHasActiveSession(patientId: number): Promise<boolean> {
  const result = await getPostgresPool().query(
    `SELECT 1
     FROM sessions
     WHERE patient_id = $1
       AND status IN ('BORRADOR', 'EN_EJECUCION')
     LIMIT 1`,
    [patientId],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function countOpenByPatientId(patientId: number): Promise<number> {
  const result = await getPostgresPool().query(
    `SELECT COUNT(*)::int AS open_count
     FROM sessions
     WHERE patient_id = $1
       AND status IN ('BORRADOR', 'EN_EJECUCION')`,
    [patientId],
  );

  return Number((result.rows[0] as { open_count: number }).open_count ?? 0);
}

export async function countByPatientId(patientId: number): Promise<number> {
  const result = await getPostgresPool().query(
    `SELECT COUNT(*)::int AS session_count
     FROM sessions
     WHERE patient_id = $1`,
    [patientId],
  );

  return Number((result.rows[0] as { session_count: number }).session_count ?? 0);
}

export async function findOpenByPatientId(patientId: number): Promise<ScreeningSession | null> {
  const result = await getPostgresPool().query(
    `SELECT id::int AS id, patient_id::int AS patient_id, created_by_user_id, status,
            started_at::text AS started_at, finished_at::text AS finished_at
     FROM sessions
     WHERE patient_id = $1
       AND status IN ('BORRADOR', 'EN_EJECUCION')
     ORDER BY id DESC
     LIMIT 1`,
    [patientId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapSession(result.rows[0] as Record<string, unknown>);
}

export async function createSessionIfNoOpen(input: CreateSessionDto): Promise<ScreeningSession | null> {
  const result = await getPostgresPool().query(
    `WITH inserted AS (
       INSERT INTO sessions (patient_id, created_by_user_id, status)
       SELECT $1, $2, 'BORRADOR'
       WHERE NOT EXISTS (
         SELECT 1
         FROM sessions
         WHERE patient_id = $1
           AND status IN ('BORRADOR', 'EN_EJECUCION')
       )
       RETURNING id::int AS id, patient_id::int AS patient_id, created_by_user_id, status,
                 started_at::text AS started_at, finished_at::text AS finished_at
     )
     SELECT * FROM inserted`,
    [input.patientId, input.createdByUserId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapSession(result.rows[0] as Record<string, unknown>);
}

export async function createSession(input: CreateSessionDto): Promise<ScreeningSession> {
  const result = await getPostgresPool().query(
    `INSERT INTO sessions (patient_id, created_by_user_id, status)
     VALUES ($1, $2, 'BORRADOR')
     RETURNING id::int AS id, patient_id::int AS patient_id, created_by_user_id, status,
               started_at::text AS started_at, finished_at::text AS finished_at`,
    [input.patientId, input.createdByUserId],
  );

  return mapSession(result.rows[0] as Record<string, unknown>);
}

export async function startSession(id: number): Promise<ScreeningSession | null> {
  const result = await getPostgresPool().query(
    `UPDATE sessions
       SET status = 'EN_EJECUCION',
           started_at = COALESCE(started_at, NOW())
     WHERE id = $1
     RETURNING id::int AS id, patient_id::int AS patient_id, created_by_user_id, status,
               started_at::text AS started_at, finished_at::text AS finished_at`,
    [id],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapSession(result.rows[0] as Record<string, unknown>);
}

export async function completeSession(id: number): Promise<ScreeningSession | null> {
  const result = await getPostgresPool().query(
    `UPDATE sessions
       SET status = 'COMPLETADA',
           finished_at = COALESCE(finished_at, NOW())
     WHERE id = $1
     RETURNING id::int AS id, patient_id::int AS patient_id, created_by_user_id, status,
               started_at::text AS started_at, finished_at::text AS finished_at`,
    [id],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapSession(result.rows[0] as Record<string, unknown>);
}

export async function deleteSession(id: number): Promise<boolean> {
  const result = await getPostgresPool().query(
    `DELETE FROM sessions WHERE id = $1`,
    [id],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updateDraftSession(
  id: number,
  input: Partial<Pick<CreateSessionDto, "patientId" | "createdByUserId">>
): Promise<ScreeningSession | null> {
  const result = await getPostgresPool().query(
    `UPDATE sessions
       SET patient_id = COALESCE($2, patient_id),
           created_by_user_id = COALESCE($3, created_by_user_id)
     WHERE id = $1
       AND status = 'BORRADOR'
     RETURNING id::int AS id, patient_id::int AS patient_id, created_by_user_id, status,
               started_at::text AS started_at, finished_at::text AS finished_at`,
    [id, input.patientId ?? null, input.createdByUserId ?? null],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapSession(result.rows[0] as Record<string, unknown>);
}

export async function findSessionsInProgress(): Promise<ScreeningSession[]> {
  const result = await getPostgresPool().query(
    `SELECT id::int AS id, patient_id::int AS patient_id, created_by_user_id, status,
            started_at::text AS started_at, finished_at::text AS finished_at
     FROM sessions
     WHERE status = 'EN_EJECUCION'
     ORDER BY started_at ASC`,
  );

  return result.rows.map((row) => mapSession(row as Record<string, unknown>));
}
