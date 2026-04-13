# QA Evidence - postgres-persistence

## Scope
This file records requirement traceability and verification evidence for the PostgreSQL persistence migration.

## Requirement Traceability
- 1.1 Docker Compose for PostgreSQL
  - Evidence: docker-compose.postgres.yml is present and starts a healthy postgres:16-alpine container.
- 1.2 SQL initialization script
  - Evidence: infra/postgres/init/001-init-schema.sql creates the required tables for patients, sessions, runtime, timing states, and session results.
- 1.3 Docker dev guide
  - Evidence: docs/docker-postgres-dev.md documents local Docker workflow and Docker vs Neon guidance.
- 2.1 pg dependency
  - Evidence: backend/package.json includes pg.
- 2.2 DB env configuration
  - Evidence: backend/src/config/env.ts includes DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL.
- 2.3 DB connection + fail-fast
  - Evidence: backend/src/shared/db/postgres.ts and startup connection check in backend/src/main.ts.
- 3.1 to 3.4 SQL repositories
  - Evidence: SQL-backed repository implementations in backend/src/shared/persistence for patients, sessions, runtime, results.
- 3.5 wiring replacement
  - Evidence: modules now use SQL repositories and no longer rely on JSON store wiring.
- 4.1 finalize-item atomic transaction
  - Evidence: finalizeItemAtomic implemented in backend/src/shared/persistence/runtime.repository.ts and consumed by execution complete endpoint.
- 4.2 recovery queries
  - Evidence: findSessionsInProgress in backend/src/shared/persistence/sessions.repository.ts and startup recovery log in backend/src/main.ts.
- 4.3 contract compatibility
  - Evidence: endpoint contracts validated by backend module tests.
- 5.1 to 5.2 tests on Docker PostgreSQL
  - Evidence: test specs migrated to Postgres setup, tests executed against containerized DB.
- 5.3 Docker vs Neon guide
  - Evidence: docs/docker-postgres-dev.md.
- 5.4 traceability and QA documentation
  - Evidence: this file.

## Test Execution Evidence
- Environment:
  - Docker Desktop running.
  - Container status: cognitia-postgres Up (healthy), host port 5433 mapped to container 5432.
- Command executed:
  - npm test (in backend)
- Effective test command:
  - npm run build && node --test --test-concurrency=1 dist/modules/auth/index.spec.js dist/modules/execution/index.spec.js dist/modules/results/index.spec.js
- Result summary:
  - tests: 17
  - pass: 17
  - fail: 0
  - suites: 2

## Notes
- Added --test-concurrency=1 in backend/package.json test script to prevent cross-file deadlocks while truncating shared tables in PostgreSQL.
- Updated auth middleware test assertion to avoid depending on an empty global patient table state.
