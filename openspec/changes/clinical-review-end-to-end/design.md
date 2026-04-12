## Context

The backend already persists runtime and item-level results in a durable JSON store and exposes session-scoped result retrieval. The execution flow can now complete and persist typed payloads, but the dedicated review feature in Angular remains a placeholder and does not provide clinician-focused navigation, filtering, or session-level interpretation.

This change crosses frontend (`results` feature, routing, API service contracts) and backend result-read behavior (query shape and aggregation support). It also impacts OpenSpec capabilities tied to completion and result interpretation.

Constraints:
- Preserve current persistence mechanism (JSON durable store) for this iteration.
- Avoid breaking existing execution runtime automation behavior.
- Keep review output explainable and minimal for a prototype clinician workflow.

Stakeholders:
- Clinician users performing post-session interpretation.
- Product/QA validating AC-06 and traceability from execution to review.

## Goals / Non-Goals

**Goals:**
- Deliver an end-to-end clinical review workflow based on real persisted data.
- Provide session-level review with item details plus basic aggregate indicators.
- Provide predictable frontend behavior for loading/empty/error/retry states.
- Align API contracts and tests so review behavior is stable and regression-resistant.

**Non-Goals:**
- Advanced analytics or longitudinal reporting across multiple patients.
- New storage engine migration (PostgreSQL remains future scope).
- Full clinical scoring algorithms beyond baseline aggregates required by the prototype.

## Decisions

1. Keep backend read model centered on session-scoped endpoints.
- Decision: Use and extend `/results/session/:sessionId` as canonical source for item-level review data, and add a lightweight session review summary endpoint if the UI needs aggregate metadata.
- Rationale: This fits the current data model and avoids premature redesign of persistence.
- Alternative considered: Introduce a new fully denormalized review API from scratch; rejected due to added complexity and duplication.

2. Build a dedicated frontend review read model in `results` feature.
- Decision: Replace placeholder `Promise.resolve([])` service behavior with typed HTTP services and view models for list/detail and aggregate cards.
- Rationale: Keeps UI composition independent from raw transport shapes and improves testability.
- Alternative considered: Bind components directly to raw API payloads; rejected due to coupling and brittle templates.

3. Aggregate metrics are computed deterministically from persisted typed payloads.
- Decision: Derive baseline aggregate indicators either server-side (preferred when reused) or in a pure shared frontend mapper when endpoint changes are unnecessary.
- Rationale: Maintains consistency with typed payload baseline and prevents ad hoc UI-only calculations.
- Alternative considered: Manual per-template calculations in component code; rejected because it is error-prone.

4. Standardize review state machine at UI level.
- Decision: Define explicit states (`idle`, `loading`, `ready`, `empty`, `error`) and render per state.
- Rationale: Eliminates ambiguous behavior and improves user trust.
- Alternative considered: Implicit state from array lengths and error flags; rejected for maintainability concerns.

5. Preserve backward compatibility for current execution flow.
- Decision: Any new backend field for review summary must be additive and optional.
- Rationale: Existing execution screens already consume result payloads and should remain unaffected.
- Alternative considered: Replace existing result response shape; rejected due to unnecessary risk.

## Risks / Trade-offs

- [Risk] Aggregate interpretation may be clinically misleading if simplified excessively. -> Mitigation: keep labels explicit as prototype indicators and document formulas in specs.
- [Risk] Frontend/backend contract drift for typed payloads and aggregates. -> Mitigation: add contract tests for endpoint shape and component mapping tests.
- [Risk] Increased latency when computing summaries on-demand for large sessions. -> Mitigation: limit current scope to session-level payload sizes and revisit with persistent precomputed summaries later.
- [Trade-off] Additive endpoint design may keep some payload redundancy. -> Mitigation: accept short-term redundancy to maintain compatibility and reduce migration risk.

## Migration Plan

1. Update OpenSpec delta specs for review workflow, result payload baseline, execution minimum flow, and frontend behavior.
2. Implement backend additive read-contract changes (if required) and unit tests.
3. Replace frontend results placeholder service/component with typed API integration and stateful UI.
4. Add frontend tests for loading/empty/error/ready states and review detail rendering.
5. Validate end-to-end flow with existing execution output and run full backend/frontend tests.

Rollback strategy:
- Revert frontend results module to previous route/module revision.
- Keep backend additive fields guarded; if rollback required, ignore new fields while preserving original endpoint behavior.

## Open Questions

- Should aggregate indicators be persisted during session completion or computed at read time for this iteration?
- Is pagination needed now for review lists, or can we defer until PostgreSQL migration?
- Should AC-06 require patient-level grouping in this phase or remain session-focused only?
