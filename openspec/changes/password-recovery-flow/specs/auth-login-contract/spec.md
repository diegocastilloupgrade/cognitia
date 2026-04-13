## MODIFIED Requirements

### Requirement: Login issues JWT for valid credentials
The system SHALL issue a JWT access token when credentials are valid. Valid credentials include the original seed password or a password previously set through a successful reset-password flow.

#### Scenario: Login with original seed password
- **WHEN** user submits valid seed email and seed password
- **THEN** system returns 200 with signed JWT and expiry metadata

#### Scenario: Login with reset password
- **WHEN** user previously reset password and submits seed email with new password
- **THEN** system returns 200 with signed JWT and expiry metadata

#### Scenario: Login with old password after reset
- **WHEN** user has reset password and submits old password
- **THEN** system returns 401 Invalid credentials
