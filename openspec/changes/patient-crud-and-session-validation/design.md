## Context

Current state:
- Patient CRUD incomplete: create (POST) works, but no edit (PATCH) or delete (DELETE)
- Sessions can be created without validation of duplicate open sessions per patient
- Frontend forms for patient edit exist as route but lack backend implementation
- PostgreSQL persistence layer already handles patients and sessions tables
- API contracts defined but endpoints missing

Constraints:
- No data migration needed (backward compatible additions)
- Existing API responses must remain compatible
- Delete operation must respect data integrity (prevent orphaning active sessions)

## Goals / Non-Goals

**Goals:**
- Enable clinicians to edit patient demographics (name, birth date)
- Enable clinicians to delete patients (with validation for active sessions)
- Prevent system from accepting duplicate open sessions per patient
- Validate at backend level (source of truth) and provide clear frontend feedback
- Maintain 100% test coverage (unit + integration)
- Keep all existing API contracts unchanged

**Non-Goals:**
- Soft delete / archival logic (hard delete only)
- Audit log for edit/delete operations
- Cascading delete of sessions (instead, prevent delete if sessions in progress)
- Complex session state machine changes (validation only on create)

## Decisions

### Decision 1: Hard Delete with Validation
**What:** DELETE `/patients/:id` performs hard delete only if no sessions exist for that patient
**Rationale:** Simple, auditable, prevents orphaned data. Soft delete adds complexity without clinical requirement
**Alternatives considered:**
  - Soft delete: adds audit trail but complicates queries with `is_deleted` flags everywhere
  - Cascade delete: dangerous (loses session/results data), rejected

### Decision 2: Backend-First Validation (Session Duplicate)
**What:** Duplicate open session check happens in backend (SQL constraint + service logic), frontend shows feedback
**Rationale:** Backend is source of truth; frontend is UX enhancement. Prevents race conditions and API misuse
**Alternatives considered:**
  - Frontend-only validation: insufficient if mobile/CLI clients added later
  - Database unique constraint: too rigid, handles application-level business rule better in code

### Decision 3: Optimistic Locking via Updated_At
**What:** Edit operations use existing `updated_at` timestamp (no explicit locking)
**Rationale:** Patient edit is low-concurrency scenario; simpler than pessimistic locks
**Alternatives considered:**
  - ETags or version numbers: adds complexity for minimal conflict risk in patient edit
  - Pessimistic row locks: unnecessary overhead

### Decision 4: No Breaking Changes to GET `/patients` or `/patients/:id`
**What:** Existing fetch endpoints unchanged; PATCH and DELETE are pure additions
**Rationale:** Seamless upgrade for existing clients
**Alternatives considered:**
  - Returning soft-delete flag: breaks contract, not needed for hard delete

## Risks / Trade-offs

**[Risk] Delete before cascading sessions completes → Orphaned results in audit**
  → Mitigation: Check sessions count inside transaction before delete; return 409 Conflict if sessions exist

**[Risk] Race condition: duplicate session check passes, then second request creates before first commits**
  → Mitigation: Use SQL isolation level READ_COMMITTED (default); race window is tiny; acceptable trade-off for simplicity

**[Risk] Frontend lag: edit/delete buttons shown before validation, user clicks and sees error**
  → Mitigation: Disable buttons during request; show clear error messages; expected UX pattern

**[Risk] Performance: checking "open sessions per patient" on every session create**
  → Mitigation: Simple index on (patient_id, status) sufficient; query < 1ms on typical data volume

## Migrations

### Deployment
1. Deploy backend changes (new endpoints) → tests validate backward compatibility
2. Deploy frontend changes → consumes new endpoints
3. GitHub Actions CI validates both independently
4. No database migrations needed

### Rollback
- Revert backend: removes endpoints (no orphaned data created)
- Revert frontend: gracefully degraded (edit/delete buttons hidden)
- Post-revert: clean up any partial session creates from race (unlikely but documented)
