## Context

Current auth implementation is seed-user based with JWT login and no recovery mechanism. For MVP and local deployment, users are configured through env variables. A recovery flow should be usable immediately without introducing external providers (SMTP/SMS) or DB migration.

## Goals / Non-Goals

**Goals:**
- Provide a complete forgot-password and reset-password flow.
- Ensure reset tokens are short-lived and single-use.
- Keep login endpoint and token structure backward compatible.
- Add frontend UX for forgot/reset paths with clear success/error states.

**Non-Goals:**
- Real email delivery integration (SMTP provider).
- Multi-user account management in database.
- Cross-device persistent reset token store.

## Decisions

1. **Token Store (MVP): in-memory token map in AuthService**
- Simple implementation, no schema migration.
- Adequate for local/dev and MVP.
- Trade-off: tokens are lost on restart.

2. **Security posture**
- `forgot-password` returns generic success message regardless of email existence.
- reset token expires in 15 minutes.
- token invalidated after successful reset.

3. **Password source of truth for MVP**
- Keep env seed password as default.
- Allow runtime password override after reset (in-memory).
- login validates against override first, then seed.

4. **Frontend routing**
- Add dedicated auth routes:
  - `/auth/forgot-password`
  - `/auth/reset-password`
- reset token entered by user in form (no email-link parsing dependency).

## Risks / Trade-offs

- **[Risk] Tokens lost on server restart**
  - Mitigation: document as MVP limitation; future DB-backed token store.
- **[Risk] Brute-force token guessing**
  - Mitigation: cryptographically random tokens, short expiry, one-time use.
- **[Risk] UX confusion on generic forgot response**
  - Mitigation: explicit informational copy in UI.

## Migration / Rollout

1. Deploy backend endpoints.
2. Deploy frontend auth routes/forms.
3. Run backend/ frontend tests.
4. Validate with manual flow: request token -> reset -> login with new password.

Rollback: revert auth endpoint additions and frontend routes; login remains unaffected.
