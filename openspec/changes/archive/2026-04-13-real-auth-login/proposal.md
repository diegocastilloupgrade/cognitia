## Por qué

El sistema tiene actualmente el endpoint `POST /api/auth/login` respondiendo con 501 (no implementado) y el servicio Angular de autenticación devuelve un token simulado sin llamar al backend. Esto significa que cualquier usuario puede acceder a todas las rutas privadas sin credenciales reales, lo que hace inviable cualquier prueba clínica o despliegue real. Es el prerequisito bloqueante para avanzar en persistencia, permisos y dockerización.

## Qué cambia

- Implementar `POST /api/auth/login` con validación de credenciales y emisión de JWT.
- Añadir middleware de autorización Bearer en todos los endpoints privados del backend.
- Reemplazar el servicio mock de autenticación de Angular por llamadas HTTP reales.
- Persistir y gestionar el token en cliente (localStorage) con expiración.
- Añadir guard de rutas privadas que redirija a `/auth/login` si no hay sesión válida.
- Añadir acción de logout que limpie el token.
- Implementar estados de interfaz de login: cargando, credenciales inválidas, error de red.
- Añadir un usuario clínico semilla hardcodeada para el prototipo (sin base de datos de usuarios aún).

## Capacidades

### Capacidades nuevas

- `auth-login-contract`: Contrato de login backend con JWT — endpoint, validación, emisión y middleware de autorización.
- `frontend-auth-session`: Gestión de sesión autenticada en Angular — servicio HTTP real, persistencia de token, guard de rutas y estados UX.

### Capacidades modificadas

- `frontend`: Las rutas privadas pasan a estar protegidas por guard de autenticación.
- `backend`: Los endpoints existentes de patients, sessions, results y execution requieren token válido.

## Impacto

- **Backend**: `backend/src/modules/auth/` — implementación completa del router de auth. Nuevo middleware `requireAuth` aplicado a todos los módulos registrados.
- **Frontend**: `frontend/src/app/features/auth/` — servicio real + componente login funcional. Nuevo `AuthGuard`. Módulo de routing principal actualizado para proteger rutas.
- **Configuración**: Variable de entorno `JWT_SECRET` requerida en backend. Semilla de usuario clínico configurable vía env o constante de prototipo.
- **Tests**: Tests de contrato backend para login y middleware. Tests Angular para AuthGuard y LoginComponent.
