import { getPostgresPool } from "../db/postgres";
import type { AnyCreateResultInput, SessionResult } from "../../modules/results/results.types";

function mapResult(row: Record<string, unknown>): SessionResult {
  return {
    id: Number(row.id),
    sessionId: Number(row.session_id),
    itemCode: String(row.item_code) as SessionResult["itemCode"],
    positionInSession: Number(row.position_in_session),
    createdAt: String(row.created_at),
    evaluatedOutcome: String(row.evaluated_outcome) as SessionResult["evaluatedOutcome"],
    data: row.data as SessionResult["data"],
  };
}

export async function listResultsBySession(sessionId: number): Promise<SessionResult[]> {
  const result = await getPostgresPool().query(
    `SELECT id::int AS id, session_id::int AS session_id, item_code, position_in_session,
            created_at::text AS created_at, evaluated_outcome, data
     FROM session_results
     WHERE session_id = $1
     ORDER BY position_in_session ASC, id ASC`,
    [sessionId],
  );

  return result.rows.map((row) => mapResult(row as Record<string, unknown>));
}

export async function upsertResult(input: AnyCreateResultInput): Promise<SessionResult> {
  const existing = await getPostgresPool().query(
    `SELECT id
     FROM session_results
     WHERE session_id = $1 AND item_code = $2
     LIMIT 1`,
    [input.sessionId, input.itemCode],
  );

  if ((existing.rowCount ?? 0) > 0) {
    const updated = await getPostgresPool().query(
      `UPDATE session_results
         SET position_in_session = $3,
             evaluated_outcome = $4,
             data = $5::jsonb
       WHERE session_id = $1 AND item_code = $2
       RETURNING id::int AS id, session_id::int AS session_id, item_code, position_in_session,
                 created_at::text AS created_at, evaluated_outcome, data`,
      [
        input.sessionId,
        input.itemCode,
        input.positionInSession,
        input.evaluatedOutcome,
        JSON.stringify(input.data),
      ],
    );

    return mapResult(updated.rows[0] as Record<string, unknown>);
  }

  const inserted = await getPostgresPool().query(
    `INSERT INTO session_results (session_id, item_code, position_in_session, evaluated_outcome, data)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id::int AS id, session_id::int AS session_id, item_code, position_in_session,
               created_at::text AS created_at, evaluated_outcome, data`,
    [
      input.sessionId,
      input.itemCode,
      input.positionInSession,
      input.evaluatedOutcome,
      JSON.stringify(input.data),
    ],
  );

  return mapResult(inserted.rows[0] as Record<string, unknown>);
}
