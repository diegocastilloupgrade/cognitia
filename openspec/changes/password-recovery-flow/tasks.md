## 1. Backend auth recovery API

- [x] 1.1 Extend auth types with forgot/reset payloads and responses
- [x] 1.2 Add in-memory reset token store (token, email, expiresAt, used)
- [x] 1.3 Implement AuthService.requestPasswordReset(email)
- [x] 1.4 Implement AuthService.resetPassword(token, newPassword)
- [x] 1.5 Update login logic to honor reset password override
- [x] 1.6 Add `/api/auth/forgot-password` route with generic 202 response
- [x] 1.7 Add `/api/auth/reset-password` route with token validation and clear 4xx errors

## 2. Frontend auth recovery screens

- [x] 2.1 Add forgot-password component (TS/HTML/CSS)
- [x] 2.2 Add reset-password component (TS/HTML/CSS)
- [x] 2.3 Extend AuthService with forgotPassword/resetPassword methods
- [x] 2.4 Add auth routes for forgot/reset pages
- [x] 2.5 Add link from login page to forgot-password

## 3. Testing and validation

- [x] 3.1 Add backend tests for forgot-password and reset-password flow
- [x] 3.2 Add frontend unit tests for forgot/reset forms
- [x] 3.3 Validate login works with reset password and rejects old one
- [x] 3.4 Run backend test suite
- [x] 3.5 Run frontend build and tests

## 4. Documentation and delivery

- [x] 4.1 Update OpenAPI with forgot/reset endpoints
- [x] 4.2 Mark OpenSpec tasks complete and prepare PR
