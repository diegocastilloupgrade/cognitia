## ADDED Requirements

### Requirement: Edit patient demographics
The system SHALL allow clinicians to update patient full name and birth date via PATCH `/patients/{id}` endpoint. The operation returns the updated patient record.

#### Scenario: Successful patient edit
- **WHEN** clinician submits PATCH `/patients/1` with `{ fullName: "Updated Name", birthDate: "1995-05-15" }`
- **THEN** system returns 200 OK with updated patient object including new fullName and birthDate

#### Scenario: Edit with missing optional field
- **WHEN** clinician submits PATCH `/patients/1` with only `{ fullName: "New Name" }`
- **THEN** system returns 200 OK, updates only fullName, preserves existing birthDate

#### Scenario: Edit with invalid date format
- **WHEN** clinician submits PATCH `/patients/1` with `{ birthDate: "invalid-date" }`
- **THEN** system returns 400 Bad Request with validation error

#### Scenario: Edit non-existent patient
- **WHEN** clinician submits PATCH `/patients/99999` with valid data
- **THEN** system returns 404 Not Found

### Requirement: Delete patient with session validation
The system SHALL allow clinicians to delete a patient via DELETE `/patients/{id}` endpoint, but SHALL prevent deletion if the patient has any sessions in progress (non-PENDIENTE status).

#### Scenario: Successful patient delete
- **WHEN** clinician submits DELETE `/patients/1` and patient has no sessions (or all sessions are PENDIENTE/COMPLETADO)
- **THEN** system returns 204 No Content, patient is deleted from database

#### Scenario: Delete patient with active session
- **WHEN** clinician submits DELETE `/patients/5` and patient has a session with status EN_EJECUCION
- **THEN** system returns 409 Conflict with message "Cannot delete patient with active sessions"

#### Scenario: Delete with cascade protection
- **WHEN** clinician submits DELETE `/patients/3` and patient has multiple sessions (some active, some completed)
- **THEN** system returns 409 Conflict (active sessions prevent deletion), patient remains intact

#### Scenario: Delete non-existent patient
- **WHEN** clinician submits DELETE `/patients/99999`
- **THEN** system returns 404 Not Found
