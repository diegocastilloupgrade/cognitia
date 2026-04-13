## ADDED Requirements

### Requirement: Forgot password form allows recovery request
The frontend SHALL provide a forgot-password form at `/auth/forgot-password` to submit user email and show a neutral confirmation message.

#### Scenario: Submit forgot form
- **WHEN** user provides email and submits form
- **THEN** frontend calls backend forgot endpoint
- **AND** shows success message independent of account existence

### Requirement: Reset password form allows token + new password
The frontend SHALL provide reset-password form at `/auth/reset-password` with token, new password, and confirmation.

#### Scenario: Successful reset
- **WHEN** user submits matching strong passwords and valid token
- **THEN** frontend calls reset endpoint and shows success state with link to login

#### Scenario: Invalid token
- **WHEN** backend returns token-invalid error
- **THEN** frontend shows clear error and keeps form editable
