## MODIFIED Requirements

### Requirement: REQ-FRONTEND-MIN-FLOW-1: SPA Angular conectada al backend minimo
El sistema MUST proveer una SPA Angular conectada al backend minimo para operar pacientes, sesiones y navegacion a ejecucion, con todas las rutas privadas protegidas por un guard de autenticación que exija sesión válida.

#### Scenario: Frontend consume patients, sessions y execution
- El frontend es una SPA Angular.
- El frontend consume /api/patients para listar y crear pacientes.
- El frontend consume /api/sessions para listar y crear sesiones.
- El frontend permite abrir una sesion y navegar a una pantalla de ejecucion de sesion conectada al backend.

#### Scenario: Rutas privadas requieren sesión autenticada
- **WHEN** el clínico accede a cualquier ruta del área privada (`/patients`, `/sessions`, `/execution`, `/results`)
- **THEN** el frontend MUST verificar la sesión mediante `AuthGuard` y redirigir a `/auth/login` si no hay token válido

## ADDED Constraints
- La UI de timing de este cambio es manual y de soporte al bootstrap, no automatiza avance entre items.
- El frontend mantiene la navegacion secuencial demo local basada en los estimulos cargados en assets.
- Todas las rutas privadas MUST estar declaradas bajo el `AuthGuard` en el módulo de routing raíz.
