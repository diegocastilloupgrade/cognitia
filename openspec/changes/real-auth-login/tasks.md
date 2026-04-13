## 1. Preparación y dependencias backend

- [ ] 1.1 Añadir `jsonwebtoken`, `dotenv` y sus tipos (`@types/jsonwebtoken`) al `package.json` del backend.
- [ ] 1.2 Crear `.env.example` con las variables `JWT_SECRET`, `JWT_EXPIRES_IN`, `COGNITIA_SEED_USER` y `COGNITIA_SEED_PASS` documentadas.
- [ ] 1.3 Cargar variables de entorno con `dotenv` en el arranque del backend y extender `EnvConfig` con los nuevos campos.

## 2. Contrato de autenticación en backend

- [ ] 2.1 Implementar `AuthService` en `backend/src/modules/auth/auth.service.ts` con método `login(email, password)` que valide contra la semilla y emita JWT.
- [ ] 2.2 Implementar el endpoint `POST /api/auth/login` en el router de auth usando el servicio anterior.
- [ ] 2.3 Implementar el middleware `requireAuth` en `backend/src/shared/middleware/require-auth.ts` que verifique el Bearer token y devuelva 401 si es inválido o ausente.
- [ ] 2.4 Aplicar `requireAuth` en `backend/src/main.ts` sobre todos los routers privados (patients, sessions, execution, results).

## 3. Tests de contrato backend

- [ ] 3.1 Añadir pruebas de contrato para `POST /api/auth/login`: credenciales válidas devuelven 200 + JWT, inválidas devuelven 401, cuerpo malformado devuelve 400.
- [ ] 3.2 Añadir pruebas para el middleware `requireAuth`: petición sin token devuelve 401, con token expirado devuelve 401, con token válido pasa.
- [ ] 3.3 Actualizar el script de tests del backend para incluir el spec de auth.

## 4. Integración de autenticación en frontend

- [ ] 4.1 Reemplazar el servicio mock `AuthService` de Angular por llamada HTTP real a `POST /api/auth/login`.
- [ ] 4.2 Implementar persistencia del token en localStorage (guardar, leer, eliminar) con comprobación de expiración decodificando `exp` del JWT.
- [ ] 4.3 Implementar `AuthGuard` en `frontend/src/app/core/guards/auth.guard.ts` que proteja las rutas privadas y redirija a `/auth/login` si no hay sesión válida.
- [ ] 4.4 Actualizar `AppRoutingModule` para aplicar `AuthGuard` en todas las rutas privadas (`/patients`, `/sessions`, `/execution`, `/results`).
- [ ] 4.5 Actualizar `LoginComponent` para usar el servicio real con estados UX: cargando, error de credenciales, error de red.
- [ ] 4.6 Implementar acción de logout (servicio + botón accesible desde la navegación principal) que limpie el token y redirija a login.

## 5. Validación y calidad

- [ ] 5.1 Añadir tests Angular para `AuthGuard`: acceso permitido con token válido, redirección a login sin token o con token expirado.
- [ ] 5.2 Añadir tests Angular para `LoginComponent`: estado cargando, error de credenciales (401), error de red.
- [ ] 5.3 Ejecutar `npm test` en backend y verificar que todos los tests (auth + existentes) pasan.
- [ ] 5.4 Ejecutar `npm run build` y `npx ng test --watch=false --browsers=ChromeHeadless` en frontend y verificar que todos los tests pasan.
- [ ] 5.5 Verificar trazabilidad AC-01 y documentar evidencias de QA del change.
