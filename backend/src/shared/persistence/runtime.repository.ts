import { getPostgresPool } from "../db/postgres";
import type { EvaluatedOutcome, ItemCode } from "../../modules/results/results.types";
import type { ItemTimingState, RuntimeSessionState } from "../../modules/execution/execution.types";

function mapTimingState(row: Record<string, unknown>): ItemTimingState {
  return {
    sessionId: Number(row.session_id),
    itemCode: row.item_code as ItemCode,
    startedAt: String(row.started_at),
    durationSeconds: Number(row.duration_seconds),
    silenceThresholdSeconds: Number(row.silence_threshold_seconds),
    silenceEvents: Array.isArray(row.silence_events)
      ? (row.silence_events as ItemTimingState["silenceEvents"])
      : [],
    completed: Boolean(row.completed),
  };
}

export async function ensureRuntimeSession(sessionId: number): Promise<void> {
  await getPostgresPool().query(
    `INSERT INTO runtime_sessions (session_id, status, active_item_code)
     VALUES ($1, 'IN_PROGRESS', NULL)
     ON CONFLICT (session_id) DO NOTHING`,
    [sessionId],
  );
}

export async function countActiveRuntimeSessions(): Promise<number> {
  const result = await getPostgresPool().query(
    `SELECT COUNT(*)::int AS total
     FROM runtime_sessions
     WHERE status = 'IN_PROGRESS'`,
  );

  return Number(result.rows[0]?.total ?? 0);
}

export async function getRuntimeSession(sessionId: number): Promise<RuntimeSessionState | null> {
  const runtimeResult = await getPostgresPool().query(
    `SELECT session_id::int AS session_id, status, active_item_code
     FROM runtime_sessions
     WHERE session_id = $1`,
    [sessionId],
  );

  if (runtimeResult.rowCount === 0) {
    return null;
  }

  const timingStatesResult = await getPostgresPool().query(
    `SELECT session_id::int AS session_id, item_code, started_at::text AS started_at,
            duration_seconds, silence_threshold_seconds, silence_events, completed
     FROM item_timing_states
     WHERE session_id = $1
     ORDER BY id ASC`,
    [sessionId],
  );

  const runtimeRow = runtimeResult.rows[0] as Record<string, unknown>;

  return {
    sessionId: Number(runtimeRow.session_id),
    status: runtimeRow.status as RuntimeSessionState["status"],
    activeItemCode: typeof runtimeRow.active_item_code === "string" ? (runtimeRow.active_item_code as ItemCode) : null,
    itemTimingStates: timingStatesResult.rows.map((row) => mapTimingState(row as Record<string, unknown>)),
  };
}

export async function getItemTimingState(sessionId: number, itemCode: ItemCode): Promise<ItemTimingState | null> {
  const result = await getPostgresPool().query(
    `SELECT session_id::int AS session_id, item_code, started_at::text AS started_at,
            duration_seconds, silence_threshold_seconds, silence_events, completed
     FROM item_timing_states
     WHERE session_id = $1 AND item_code = $2`,
    [sessionId, itemCode],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapTimingState(result.rows[0] as Record<string, unknown>);
}

export async function listItemTimingStates(sessionId: number): Promise<ItemTimingState[]> {
  const result = await getPostgresPool().query(
    `SELECT session_id::int AS session_id, item_code, started_at::text AS started_at,
            duration_seconds, silence_threshold_seconds, silence_events, completed
     FROM item_timing_states
     WHERE session_id = $1
     ORDER BY id ASC`,
    [sessionId],
  );

  return result.rows.map((row) => mapTimingState(row as Record<string, unknown>));
}

export async function upsertItemTimingState(input: {
  sessionId: number;
  itemCode: ItemCode;
  startedAt: string;
  durationSeconds: number;
  silenceThresholdSeconds: number;
}): Promise<ItemTimingState> {
  await ensureRuntimeSession(input.sessionId);

  const result = await getPostgresPool().query(
    `INSERT INTO item_timing_states (
       session_id,
       item_code,
       started_at,
       duration_seconds,
       silence_threshold_seconds,
       silence_events,
       completed
     ) VALUES ($1, $2, $3::timestamptz, $4, $5, '[]'::jsonb, FALSE)
     ON CONFLICT (session_id, item_code) DO UPDATE
       SET started_at = EXCLUDED.started_at,
           duration_seconds = EXCLUDED.duration_seconds,
           silence_threshold_seconds = EXCLUDED.silence_threshold_seconds,
           silence_events = '[]'::jsonb,
           completed = FALSE
     RETURNING session_id::int AS session_id, item_code, started_at::text AS started_at,
               duration_seconds, silence_threshold_seconds, silence_events, completed`,
    [input.sessionId, input.itemCode, input.startedAt, input.durationSeconds, input.silenceThresholdSeconds],
  );

  await getPostgresPool().query(
    `UPDATE runtime_sessions
       SET active_item_code = $2,
           status = 'IN_PROGRESS',
           updated_at = NOW()
     WHERE session_id = $1`,
    [input.sessionId, input.itemCode],
  );

  return mapTimingState(result.rows[0] as Record<string, unknown>);
}

export async function appendSilenceEvent(input: {
  sessionId: number;
  itemCode: ItemCode;
  eventType: "FIRST_SILENCE" | "SECOND_SILENCE";
}): Promise<ItemTimingState | null> {
  const existing = await getItemTimingState(input.sessionId, input.itemCode);
  if (!existing) {
    return null;
  }

  const nextEvents = [
    ...existing.silenceEvents,
    {
      occurredAt: new Date().toISOString(),
      type: input.eventType,
    },
  ];

  const result = await getPostgresPool().query(
    `UPDATE item_timing_states
       SET silence_events = $3::jsonb
     WHERE session_id = $1 AND item_code = $2
     RETURNING session_id::int AS session_id, item_code, started_at::text AS started_at,
               duration_seconds, silence_threshold_seconds, silence_events, completed`,
    [input.sessionId, input.itemCode, JSON.stringify(nextEvents)],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapTimingState(result.rows[0] as Record<string, unknown>);
}

export async function markItemCompleted(sessionId: number, itemCode: ItemCode): Promise<ItemTimingState | null> {
  const result = await getPostgresPool().query(
    `UPDATE item_timing_states
       SET completed = TRUE
     WHERE session_id = $1 AND item_code = $2
     RETURNING session_id::int AS session_id, item_code, started_at::text AS started_at,
               duration_seconds, silence_threshold_seconds, silence_events, completed`,
    [sessionId, itemCode],
  );

  if (result.rowCount === 0) {
    return null;
  }

  await getPostgresPool().query(
    `UPDATE runtime_sessions
       SET active_item_code = NULL,
           updated_at = NOW()
     WHERE session_id = $1`,
    [sessionId],
  );

  return mapTimingState(result.rows[0] as Record<string, unknown>);
}

export async function completeRuntimeSession(sessionId: number): Promise<void> {
  await getPostgresPool().query(
    `UPDATE runtime_sessions
       SET status = 'COMPLETED',
           active_item_code = NULL,
           updated_at = NOW()
     WHERE session_id = $1`,
    [sessionId],
  );
}

/**
 * Atomically marks an item as completed, persists its result (if any),
 * and either advances to the next item or closes the runtime + session.
 * All operations run in a single PostgreSQL transaction.
 */
export async function finalizeItemAtomic(input: {
  sessionId: number;
  itemCode: ItemCode;
  result: {
    positionInSession: number;
    evaluatedOutcome: EvaluatedOutcome;
    data: unknown;
  } | null;
  nextItem: {
    itemCode: ItemCode;
    durationSeconds: number;
    silenceThresholdSeconds: number;
    startedAt: string;
  } | null;
}): Promise<{
  completedState: ItemTimingState;
  nextItemState: ItemTimingState | null;
}> {
  const client = await getPostgresPool().connect();
  try {
    await client.query("BEGIN");

    // 1. Mark current item as completed
    const completedResult = await client.query(
      `UPDATE item_timing_states
         SET completed = TRUE
       WHERE session_id = $1 AND item_code = $2
       RETURNING session_id::int AS session_id, item_code, started_at::text AS started_at,
                 duration_seconds, silence_threshold_seconds, silence_events, completed`,
      [input.sessionId, input.itemCode],
    );

    if ((completedResult.rowCount ?? 0) === 0) {
      await client.query("ROLLBACK");
      throw new Error(`Item timing state not found: sessionId=${input.sessionId} itemCode=${input.itemCode}`);
    }

    const completedState = mapTimingState(completedResult.rows[0] as Record<string, unknown>);

    // 2. Upsert result if provided (within the same transaction)
    if (input.result) {
      const existingResult = await client.query(
        `SELECT id FROM session_results WHERE session_id = $1 AND item_code = $2 LIMIT 1`,
        [input.sessionId, input.itemCode],
      );

      if ((existingResult.rowCount ?? 0) > 0) {
        await client.query(
          `UPDATE session_results
             SET position_in_session = $3,
                 evaluated_outcome = $4,
                 data = $5::jsonb
           WHERE session_id = $1 AND item_code = $2`,
          [
            input.sessionId,
            input.itemCode,
            input.result.positionInSession,
            input.result.evaluatedOutcome,
            JSON.stringify(input.result.data),
          ],
        );
      } else {
        await client.query(
          `INSERT INTO session_results (session_id, item_code, position_in_session, evaluated_outcome, data)
           VALUES ($1, $2, $3, $4, $5::jsonb)`,
          [
            input.sessionId,
            input.itemCode,
            input.result.positionInSession,
            input.result.evaluatedOutcome,
            JSON.stringify(input.result.data),
          ],
        );
      }
    }

    // 3. Advance to next item or complete the session
    let nextItemState: ItemTimingState | null = null;

    if (input.nextItem) {
      const nextItemResult = await client.query(
        `INSERT INTO item_timing_states (
           session_id, item_code, started_at, duration_seconds,
           silence_threshold_seconds, silence_events, completed
         ) VALUES ($1, $2, $3::timestamptz, $4, $5, '[]'::jsonb, FALSE)
         ON CONFLICT (session_id, item_code) DO UPDATE
           SET started_at = EXCLUDED.started_at,
               duration_seconds = EXCLUDED.duration_seconds,
               silence_threshold_seconds = EXCLUDED.silence_threshold_seconds,
               silence_events = '[]'::jsonb,
               completed = FALSE
         RETURNING session_id::int AS session_id, item_code, started_at::text AS started_at,
                   duration_seconds, silence_threshold_seconds, silence_events, completed`,
        [
          input.sessionId,
          input.nextItem.itemCode,
          input.nextItem.startedAt,
          input.nextItem.durationSeconds,
          input.nextItem.silenceThresholdSeconds,
        ],
      );

      await client.query(
        `UPDATE runtime_sessions
           SET active_item_code = $2, status = 'IN_PROGRESS', updated_at = NOW()
         WHERE session_id = $1`,
        [input.sessionId, input.nextItem.itemCode],
      );

      nextItemState = mapTimingState(nextItemResult.rows[0] as Record<string, unknown>);
    } else {
      // Complete both the runtime session and the clinical session atomically
      await client.query(
        `UPDATE runtime_sessions
           SET status = 'COMPLETED', active_item_code = NULL, updated_at = NOW()
         WHERE session_id = $1`,
        [input.sessionId],
      );

      await client.query(
        `UPDATE sessions
           SET status = 'COMPLETADA', finished_at = COALESCE(finished_at, NOW())
         WHERE id = $1`,
        [input.sessionId],
      );
    }

    await client.query("COMMIT");
    return { completedState, nextItemState };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
