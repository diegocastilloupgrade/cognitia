## Why

The product currently supports login only. Users who forget their password have no recovery path, causing lockout and support dependency. Implementing password recovery is required to complete the authentication stories already defined in product specs.

## What Changes

- Add forgot-password flow in backend:
  - `POST /api/auth/forgot-password` to request recovery token.
  - `POST /api/auth/reset-password` to set a new password using a valid token.
- Add forgot/reset UI in frontend auth module:
  - `/auth/forgot-password`
  - `/auth/reset-password`
- Add secure token lifecycle:
  - token generation
  - expiration window
  - one-time token usage
- Keep login contract backward compatible.

## Capabilities

### New Capabilities
- `password-recovery-backend`: Forgot/reset endpoints, token issuance, token validation and one-time password reset.
- `password-recovery-frontend`: Forgot/reset forms and user feedback flow in auth module.

### Modified Capabilities
- `auth-login-contract`: Login SHALL accept the newly reset password and reject old password after successful reset.

## Impact

- Backend auth module (`backend/src/modules/auth/*`)
- Frontend auth module (`frontend/src/app/features/auth/*`)
- Auth tests (backend and frontend)
- OpenAPI auth paths update
- No database schema change for initial version (in-memory token store acceptable for MVP)
