## Contexto

El backend expone un endpoint `POST /api/auth/login` que actualmente devuelve 501. El servicio Angular `AuthService` devuelve un token falso sin hacer ninguna llamada HTTP. No existe guard de rutas ni validación de sesión. Cualquier usuario accede a todas las rutas sin autenticarse. Este change implementa autenticación mínima real de extremo a extremo sin introducir una base de datos de usuarios todavía (prototipo con credenciales semilla en variables de entorno).

## Objetivos / No-objetivos

**Objetivos:**
- Login backend funcional con JWT y un usuario clínico semilla.
- Middleware `requireAuth` que rechace peticiones sin token válido en todos los endpoints privados.
- Servicio Angular real con HTTP + persistencia de token + expiración en localStorage.
- Guard de rutas privadas en Angular con redirección a login.
- Logout que limpie la sesión.
- Estados UX claros en la pantalla de login (cargando, error de credenciales, error de red).
- Tests de contrato backend para login y middleware.
- Tests Angular para AuthGuard y LoginComponent.

**No-objetivos:**
- Gestión de usuarios (alta, baja, cambio de contraseña) — fuera de alcance hasta que haya BBDD real.
- Roles y permisos granulares — se añadirán en un change futuro.
- OAuth / SSO / MFA.
- Refresh token — el token de larga duración es suficiente para el prototipo.

## Decisiones

### D-1: Usuario semilla en variables de entorno, no en BBDD

**Decisión:** Las credenciales del clínico se cargan desde `COGNITIA_SEED_USER` y `COGNITIA_SEED_PASS` (con valores por defecto de prototipo). No se introduce tabla de usuarios todavía.

**Alternativas consideradas:**
- Tabla `users` desde este change → sobrecarga innecesaria sin ORM ni migraciones. El change de Postgres lo hará mejor.
- Credenciales hardcodeadas en código → no pueden ser modificadas sin redeployar y suponen un riesgo de seguridad.

**Razón:** Mantiene el change enfocado en el contrato de autenticación. La semilla en env permite cambiarla sin tocar código y es segura si el env no se commitea.

### D-2: JWT firmado con HS256, expiración configurable

**Decisión:** Token JWT firmado con `HS256` usando `JWT_SECRET` de variable de entorno. Expiración de 8 horas por defecto (configurable con `JWT_EXPIRES_IN`).

**Alternativas consideradas:**
- Sesiones de servidor (express-session) → requiere store compartido; incompatible con futuro deploy en contenedores sin Redis.
- RS256 con clave asimétrica → overkill para prototipo sin múltiples servicios que verifiquen tokens.

**Razón:** HS256 + JWT es sin estado, fácil de verificar en middleware y compatible con el futuro despliegue dockerizado.

### D-3: Middleware `requireAuth` como función Express reutilizable

**Decisión:** Un único middleware `requireAuth(req, res, next)` que extrae y verifica el Bearer token. Se aplica en `src/main.ts` sobre todos los routers privados, no individualmente en cada ruta.

**Alternativas consideradas:**
- Decoradores por ruta → no aplica en Express plano sin framework de decoradores.
- Guard por módulo → duplicación de lógica.

**Razón:** Un punto central de control de acceso facilita auditoría y evita olvidar proteger rutas nuevas.

### D-4: Token en localStorage con verificación de expiración en cliente

**Decisión:** El token JWT se guarda en `localStorage` bajo la clave `cognitia_token`. El `AuthGuard` Angular verifica expiración decodificando el `exp` del payload antes de permitir la navegación.

**Alternativas consideradas:**
- Cookie HttpOnly → requiere configuración CORS + SameSite en backend, complejidad extra para prototipo.
- sessionStorage → se pierde al cerrar pestaña, frustrante para uso clínico.

**Razón:** localStorage es simple para el prototipo. Se revisará a cookie HttpOnly cuando se dockerice y se añada CORS controlado.

## Riesgos / Trade-offs

- **[Riesgo] Credenciales semilla expuestas si el `.env` se commitea** → el `.gitignore` ya excluye `.env`; añadir nota en README de que `JWT_SECRET` es obligatorio en producción.
- **[Riesgo] Token de larga duración sin revocación** → aceptable para prototipo; se abordará con refresh token o blacklist cuando haya BBDD.
- **[Trade-off] localStorage es vulnerable a XSS** → la app no carga scripts externos en el prototipo; migración a cookie HttpOnly planificada con dockerización.
- **[Riesgo] Tests Angular con ChromeHeadless en CI** → ya validado en el change anterior; no introduce riesgo nuevo.

## Plan de migración / despliegue

1. Añadir `jsonwebtoken` y `@types/jsonwebtoken` al backend como dependencias.
2. Definir `JWT_SECRET`, `JWT_EXPIRES_IN`, `COGNITIA_SEED_USER`, `COGNITIA_SEED_PASS` en `.env.example`.
3. Implementar backend: auth service + router + middleware.
4. Aplicar `requireAuth` en `main.ts` sobre todos los routers privados.
5. Implementar frontend: servicio HTTP real + LoginComponent funcional + AuthGuard + logout.
6. Verificar tests backend y frontend.

**Rollback:** Revertir el commit de implementación devuelve el 501 y el mock de frontend. No hay cambios de esquema de datos que requieran rollback adicional.

## Preguntas abiertas

- ¿Se usará un `.env` local o se definen vars directamente en el entorno del servidor de desarrollo? → Asumo `.env` con `dotenv` para local; la implementación lo hará configurable.
