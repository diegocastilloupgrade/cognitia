## Evidencias QA del change: real-auth-login

Fecha: 2026-04-13

## Trazabilidad AC-01 (Login)

- Criterio origen: `AC-01 Login` en `openspec/specs/03-product/acceptance-criteria.md`.
- Capacidad nueva: `auth-login-contract`.
- Capacidad nueva: `frontend-auth-session`.
- Capacidades modificadas: `frontend`, `execution-minimum-flow`.

Cobertura funcional implementada:
- `POST /api/auth/login` valida credenciales semilla y retorna JWT + expiración.
- Endpoints privados backend (`patients`, `sessions`, `execution`, `results`) quedan protegidos con Bearer token.
- Frontend usa login HTTP real y persiste token en `localStorage` con validación de expiración (`exp`).
- `AuthGuard` protege rutas privadas y redirige a `/auth/login` sin sesión válida.
- Acción de logout limpia token y devuelve al login.

## Evidencia técnica backend

Cambios aplicados:
- Implementación de `AuthService` con emisión JWT HS256 y expiración configurable.
- Implementación de `POST /api/auth/login` con respuestas 200/400/401 según contrato.
- Middleware `requireAuth` para autorización Bearer en rutas privadas.
- Nuevas pruebas de contrato en `backend/src/modules/auth/index.spec.ts`.

Validación ejecutada:
- Comando: `npm test` en `backend/`.
- Resultado: 17 pruebas exitosas, 0 fallos.
- Incluye casos de login válido/inválido/malformado y middleware sin token, token expirado y token válido.

## Evidencia técnica frontend

Cambios aplicados:
- `AuthService` reemplazado por implementación HTTP real a `/api/auth/login`.
- Persistencia de sesión (`saveToken`, `getToken`, `hasValidSession`, `logout`).
- `AuthGuard` aplicado en rutas privadas.
- `LoginComponent` con estados UX: cargando, error de credenciales, error de red.
- Botón de logout en navegación principal.

Validación ejecutada:
- Comando: `npm run build` en `frontend/`.
- Resultado: build exitoso.
- Comando: `npx ng test --watch=false --browsers=ChromeHeadless` en `frontend/`.
- Resultado: 12 pruebas exitosas, 0 fallos.
- Incluye pruebas nuevas de `AuthGuard` y `LoginComponent`.

## Conclusión

La trazabilidad AC-01 queda cubierta de extremo a extremo para el alcance actual del prototipo con evidencia de contrato backend y comportamiento frontend.
