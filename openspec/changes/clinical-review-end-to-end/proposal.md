## Why

The prototype already persists item-level results and runtime state, but the dedicated clinical review experience is still incomplete and does not satisfy the product acceptance criterion for post-session review. This should be addressed now to close the functional loop from session execution to clinical interpretation.

## What Changes

- Implement end-to-end clinical review flow using real backend data instead of placeholder logic in the results feature.
- Add session-level result visualization with item detail and basic aggregated indicators suitable for clinician review.
- Add retrieval and filtering behavior in the review flow to find relevant completed sessions quickly.
- Define consistent empty/loading/error states for review screens to make behavior predictable and testable.
- Add automated tests that verify review behavior from API contract to Angular UI rendering.

## Capabilities

### New Capabilities
- `clinical-review-workflow`: End-to-end clinician review flow for completed sessions, including retrieval, visualization, and filtering of persisted results.

### Modified Capabilities
- `result-payload-baseline`: Extend result access and presentation requirements so persisted item payloads are consumable in dedicated review screens.
- `execution-minimum-flow`: Extend completion requirements to guarantee the output needed by the clinical review workflow.
- `frontend`: Add requirements for dedicated review UI states and navigation behavior for completed-session analysis.

## Impact

- Frontend module: `frontend/src/app/features/results` (services, components, routing, tests).
- Backend module: `backend/src/modules/results` (query/read contract enhancements if needed for review UX).
- Potential API contract adjustments for review list/detail endpoints and aggregate fields.
- OpenSpec updates in review, results payload, and execution flow capabilities to keep requirements aligned with implementation.
