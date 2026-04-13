## ADDED Requirements

### Requirement: Forgot password endpoint issues reset token securely
The system SHALL expose `POST /api/auth/forgot-password` that accepts an email and returns a generic success response regardless of account existence. If account exists, the system SHALL generate a cryptographically random reset token with expiration and mark it as pending use.

#### Scenario: Existing user requests password recovery
- **WHEN** user submits a valid known email to `/api/auth/forgot-password`
- **THEN** system returns 202 Accepted with a generic success message
- **AND** system stores a token with 15-minute expiry

#### Scenario: Unknown user requests password recovery
- **WHEN** user submits an unknown email to `/api/auth/forgot-password`
- **THEN** system returns 202 Accepted with the same generic success message

### Requirement: Reset password endpoint enforces one-time token validation
The system SHALL expose `POST /api/auth/reset-password` requiring token and newPassword. Reset SHALL succeed only for non-expired, unused tokens and SHALL invalidate token immediately after use.

#### Scenario: Reset with valid token
- **WHEN** user submits valid token and valid newPassword
- **THEN** system returns 200 OK and confirms password reset
- **AND** token becomes unusable

#### Scenario: Reset with expired token
- **WHEN** user submits an expired token
- **THEN** system returns 400 Bad Request with token-expired message

#### Scenario: Reset with already used token
- **WHEN** user submits a token already consumed
- **THEN** system returns 400 Bad Request with invalid-token message
