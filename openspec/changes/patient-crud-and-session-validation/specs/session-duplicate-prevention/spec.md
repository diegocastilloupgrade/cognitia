## ADDED Requirements

### Requirement: Prevent duplicate open sessions per patient
The system SHALL enforce a business rule that prevents a patient from having more than one open (non-completed) session at the same time. Validation SHALL occur at the backend API level (source of truth) when attempting to create a new session.

#### Scenario: Create session when no open session exists
- **WHEN** clinician submits POST `/sessions` with valid `patientId` that has no open sessions
- **THEN** system returns 201 Created with new session object, session status is PENDIENTE

#### Scenario: Reject duplicate open session
- **WHEN** clinician submits POST `/sessions` with `patientId` that already has a session with status EN_EJECUCION
- **THEN** system returns 409 Conflict with message "Patient already has an open session"

#### Scenario: Allow new session after previous is completed
- **WHEN** patient's previous session status is COMPLETADO and clinician submits POST `/sessions` for same patient
- **THEN** system returns 201 Created, new session is created successfully

#### Scenario: Multiple completed sessions, one open
- **WHEN** patient has 3 completed sessions and 1 open session (EN_EJECUCION), clinician tries to create another
- **THEN** system returns 409 Conflict, rejecting the new session request

#### Scenario: Concurrent session attempts
- **WHEN** two simultaneous requests attempt to create sessions for the same patient with no open sessions
- **THEN** one request succeeds with 201 Created, second request receives 409 Conflict (guaranteed by database isolation)

### Requirement: Frontend feedback for duplicate session
The system's frontend SHALL validate against duplicate open sessions before submission and provide user-facing feedback to prevent unnecessary API calls.

#### Scenario: Edit mode shows duplicate warning
- **WHEN** clinician navigates to "Create Session" form and selects a patient with an open session
- **THEN** frontend displays alert/warning "This patient already has an open session" and disables submit button

#### Scenario: User can view existing open session
- **WHEN** frontend detects duplicate open session, clinician can click link to view/resume existing session
- **THEN** navigation routes to `/sessions/{existingSessionId}/` instead of creating new
