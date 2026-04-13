## ADDED Requirements

### Requirement: Servicio Angular de autenticación con HTTP real
El frontend MUST comunicarse con el backend para autenticar al clínico, persistir el token recibido y exponerlo al resto de la aplicación.

#### Scenario: Login exitoso persiste token y redirige
- **WHEN** el clínico introduce credenciales válidas y confirma el login
- **THEN** el frontend MUST llamar a `POST /api/auth/login`, guardar el `accessToken` en localStorage bajo la clave `cognitia_token`, y navegar a la ruta privada principal (`/patients`)

#### Scenario: Login fallido muestra error de credenciales
- **WHEN** el backend responde con HTTP 401
- **THEN** el frontend MUST mostrar un mensaje de error de credenciales sin revelar detalles técnicos

#### Scenario: Error de red en login
- **WHEN** la petición de login falla por error de red
- **THEN** el frontend MUST mostrar un estado de error de red y permitir reintentar

#### Scenario: Logout limpia la sesión y redirige a login
- **WHEN** el clínico ejecuta la acción de logout
- **THEN** el frontend MUST eliminar el token de localStorage y navegar a `/auth/login`

### Requirement: Guard de rutas privadas basado en token válido
El frontend MUST proteger todas las rutas privadas verificando la existencia y vigencia del token JWT antes de permitir la navegación.

#### Scenario: Acceso permitido con sesión activa
- **WHEN** el clínico navega a una ruta privada y existe un token válido (no expirado) en localStorage
- **THEN** el frontend MUST permitir la navegación

#### Scenario: Redirección a login sin sesión
- **WHEN** el clínico navega a una ruta privada y no existe token o el token ha expirado
- **THEN** el frontend MUST redirigir a `/auth/login` sin mostrar la ruta solicitada

### Requirement: Estados de interfaz en pantalla de login
El frontend MUST mostrar estados explícitos durante el proceso de login para dar retroalimentación clara al clínico.

#### Scenario: Estado cargando durante petición de login
- **WHEN** se ha enviado el formulario de login y la petición está en curso
- **THEN** el frontend MUST deshabilitar el botón de login y mostrar un indicador de carga

#### Scenario: Estado inactivo al entrar a la pantalla de login
- **WHEN** el clínico accede a la pantalla de login sin haber interactuado
- **THEN** el frontend MUST mostrar el formulario en estado inicial sin mensajes de error

## ADDED Constraints
- El token se decodifica en cliente únicamente para leer el campo `exp` y comprobar expiración; no se confía en el payload del cliente como fuente de verdad de identidad.
- El `AuthGuard` MUST ser el único punto de decisión de acceso a rutas privadas en el módulo de routing principal.
