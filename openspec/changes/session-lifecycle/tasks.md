## 1. Backend: Database and Service Layer

- [x] 1.1 Create database migration to add started_at and completed_at columns to sessions table (both nullable, default NULL)
- [x] 1.2 Update SessionService to add startSession(id) method with precondition validation (patient assigned, scheduled date, required fields, not already executed)
- [x] 1.3 Update SessionService to add completeSession(id) method with validation (must be in EN_EJECUCION, must have results recorded)
- [x] 1.4 Add state validation utility function to prevent invalid transitions and return descriptive error messages
- [x] 1.5 Update SessionService delete method to check session state and reject deletion of EN_EJECUCION or COMPLETADA sessions with HTTP 403
- [x] 1.6 Update SessionService update (PATCH) method to restrict editable fields based on session state (all fields for BORRADOR, notes-only for EN_EJECUCION, reject all for COMPLETADA)

## 2. Backend: API Endpoints

- [x] 2.1 Add POST /api/sessions/:id/start endpoint that calls startSession() and returns updated session with 200 status
- [x] 2.2 Add error handling to /start endpoint to return 400 with descriptive message for failed preconditions
- [x] 2.3 Add POST /api/sessions/:id/complete endpoint that calls completeSession() and returns updated session with 200 status
- [x] 2.4 Add error handling to /complete endpoint to return 400 for invalid state transitions
- [x] 2.5 Update GET /api/sessions/:id to include started_at and completed_at in response payload
- [x] 2.6 Add unit tests for startSession() covering: success case, missing patient rejection, missing date rejection, already executed rejection
- [x] 2.7 Add unit tests for completeSession() covering: success case, reject from BORRADOR, reject from COMPLETADA
- [x] 2.8 Add integration tests for /start and /complete endpoints with mocked database

## 3. Frontend: Session Detail Component State Machine Display

- [x] 3.1 Update SessionDetailComponent to read session.status and determine available actions (show/hide buttons)
- [x] 3.2 Display state badge in session detail header ("Borrador" | "En ejecución" | "Completada") with appropriate styling
- [x] 3.3 Add readiness checklist below form showing: Patient ✓/✗, Scheduled Date ✓/✗, Required Fields ✓/✗, Already Executed ✗ (if applicable)
- [x] 3.4 Show "Listo para ejecutar" indicator when all preconditions met for BORRADOR sessions
- [x] 3.5 Disable start button and show tooltip when preconditions unmet for BORRADOR sessions

## 4. Frontend: State Transition Buttons and Modals

- [x] 4.1 Add "Iniciar ejecución" button to SessionDetailComponent for BORRADOR sessions
- [x] 4.2 Add confirmation modal component showing "¿Iniciar ejecución de la sesión?" with Sí/No buttons
- [x] 4.3 Call POST /api/sessions/:id/start on modal confirmation and handle success (refresh session, show toast)
- [x] 4.4 Handle start endpoint errors: catch 400 response, parse error message, display specific warning (e.g., "Paciente requerido")
- [x] 4.5 Add "Completar" button to SessionDetailComponent for EN_EJECUCION sessions (only show if results exist)
- [x] 4.6 Add confirmation modal component showing "¿Marcar sesión como completada?" with Sí/No buttons
- [x] 4.7 Call POST /api/sessions/:id/complete on modal confirmation and handle success (refresh session, show toast, navigate to results view)
- [x] 4.8 Handle complete endpoint errors and display descriptive messages

## 5. Frontend: Completion Summary and Post-State UI

- [x] 5.1 Add completion summary section displaying results count, started_at, completed_at, and calculated duration for COMPLETADA sessions
- [x] 5.2 Format timestamps as "Completado el 14 de abril de 2026 a las 14:30" with locale-aware date formatting
- [x] 5.3 Add "Ver resultados" button in completion summary linking to results detail view
- [x] 5.4 Add "Descargar resultados" button for COMPLETADA sessions (export functionality separate task)
- [x] 5.5 Add "Archivar" button for COMPLETADA sessions (archive functionality may be separate task)
- [x] 5.6 Hide edit form and show read-only session view for COMPLETADA sessions

## 6. Frontend: Session List Component Updates

- [x] 6.1 Update SessionListComponent to display state as column in list table with badges
- [x] 6.2 Add state-specific action columns: For BORRADOR show "Editar", "Iniciar", "Eliminar"; for EN_EJECUCION show "Ver" only; for COMPLETADA show "Ver" and optionally "Archivar"
- [x] 6.3 Hide delete button for EN_EJECUCION and COMPLETADA sessions
- [x] 6.4 Update delete confirmation to check session state and warn "No se puede eliminar sesiones en ejecución o completadas"
- [x] 6.5 Add completion summary in list row for COMPLETADA sessions (e.g., "✓ Completado el 14 ago")

## 7. Frontend: Unit Tests

- [x] 7.1 Add tests to SessionDetailComponent for state badge display (BORRADOR, EN_EJECUCION, COMPLETADA)
- [x] 7.2 Add tests for visible/hidden buttons based on state (start button shows only for BORRADOR, complete button only for EN_EJECUCION)
- [x] 7.3 Add tests for readiness checklist display and enable/disable of start button based on preconditions
- [x] 7.4 Add tests for start confirmation modal: modal appears on button click, calls startSession() on confirm, updates session on success
- [x] 7.5 Add tests for error handling: 400 response shows error message, precondition failure warnings display correctly
- [x] 7.6 Add tests to SessionListComponent for state badges in rows and action button visibility by state
- [x] 7.7 Add tests to SessionService for startSession() and completeSession() method calls with mock HTTP endpoints
- [ ] 7.8 Add E2E test for full workflow: draft → start execution → mark complete flow

## 8. Delivery and Validation

- [x] 8.1 Run all backend unit tests and verify 100% passing (precondition, state machine, endpoint tests)
- [x] 8.2 Run all frontend unit tests and verify 100% passing (30+ tests expected)
- [ ] 8.3 Perform manual E2E testing: create session → complete fields → start execution → mark complete → verify timestamps and UI
- [x] 8.4 Verify state restrictions: try to delete EN_EJECUCION session (should fail), try to edit COMPLETADA session (should be read-only)
- [ ] 8.5 Create feature branch, commit changes, push to repository
- [ ] 8.6 Verify CI/CD pipeline passes (tests, builds)
- [ ] 8.7 Create pull request with description linking to OpenSpec proposal
- [ ] 8.8 Archive session-lifecycle change to openspec/changes/archive/ after merge and deployment
