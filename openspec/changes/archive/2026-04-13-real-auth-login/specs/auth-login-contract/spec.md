## ADDED Requirements

### Requirement: Login de clínico con credenciales y emisión de JWT
El sistema MUST validar las credenciales del clínico contra la semilla configurada y, si son correctas, emitir un JWT firmado con expiración.

#### Scenario: Login exitoso con credenciales válidas
- **WHEN** el clínico envía `POST /api/auth/login` con email y contraseña correctos
- **THEN** el sistema MUST responder con HTTP 200 y un objeto `{ accessToken, expiresInSeconds }` donde `accessToken` es un JWT firmado válido

#### Scenario: Login rechazado con credenciales inválidas
- **WHEN** el clínico envía `POST /api/auth/login` con email o contraseña incorrectos
- **THEN** el sistema MUST responder con HTTP 401 y un mensaje de error genérico que no revele cuál de los dos campos es incorrecto

#### Scenario: Login rechazado con cuerpo malformado
- **WHEN** el cliente envía `POST /api/auth/login` sin los campos `email` o `password`
- **THEN** el sistema MUST responder con HTTP 400

### Requirement: Middleware de autorización Bearer en endpoints privados
El sistema MUST rechazar peticiones sin token JWT válido a cualquier endpoint privado.

#### Scenario: Petición autorizada con token válido
- **WHEN** el cliente envía una petición a un endpoint privado con cabecera `Authorization: Bearer <token>` y el token es válido y no ha expirado
- **THEN** el sistema MUST procesar la petición normalmente

#### Scenario: Petición rechazada sin token
- **WHEN** el cliente envía una petición a un endpoint privado sin cabecera `Authorization`
- **THEN** el sistema MUST responder con HTTP 401

#### Scenario: Petición rechazada con token expirado o inválido
- **WHEN** el cliente envía una petición a un endpoint privado con un token expirado, malformado o firmado con clave incorrecta
- **THEN** el sistema MUST responder con HTTP 401

## ADDED Constraints
- Las credenciales semilla se cargan desde variables de entorno `COGNITIA_SEED_USER` y `COGNITIA_SEED_PASS`. No se almacenan en base de datos en este change.
- El secreto JWT se configura con `JWT_SECRET`. El backend MUST fallar al arrancar si esta variable no está definida en entorno de producción.
- El endpoint `POST /api/auth/login` es público (no requiere token).
