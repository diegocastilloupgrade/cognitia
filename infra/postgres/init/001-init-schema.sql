CREATE TABLE IF NOT EXISTS patients (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  sex TEXT,
  internal_code TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients (id),
  created_by_user_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('BORRADOR', 'EN_EJECUCION', 'COMPLETADA')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS runtime_sessions (
  session_id BIGINT PRIMARY KEY REFERENCES sessions (id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
  active_item_code TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_timing_states (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL,
  silence_threshold_seconds INTEGER NOT NULL,
  silence_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_item_timing UNIQUE (session_id, item_code)
);

CREATE TABLE IF NOT EXISTS session_results (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  position_in_session INTEGER NOT NULL,
  evaluated_outcome TEXT NOT NULL CHECK (evaluated_outcome IN ('ACIERTO', 'ERROR', 'OMISION', 'NO_APLICA')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions (patient_id);
CREATE INDEX IF NOT EXISTS idx_item_timing_session_id ON item_timing_states (session_id);
CREATE INDEX IF NOT EXISTS idx_results_session_id ON session_results (session_id);
CREATE INDEX IF NOT EXISTS idx_results_session_position ON session_results (session_id, position_in_session);
