## Purpose

Definir los requisitos base del frontend Angular para consumir la API mínima de COGNITIA y operar el flujo bootstrap, incluyendo UI manual de timing/silencios en ejecución.

## Requirements

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

### Requirement: REQ-FRONTEND-EXECUTION-TIMING-1: UI baseline de timing y silencios en ejecucion
El sistema MUST proveer en la pantalla de ejecucion una UI baseline para consultar y operar el estado manual de timing y silencios del item visible.

#### Scenario: Visualizar timing del item actual
- **WHEN** el usuario abre la pantalla de ejecucion con una sesion valida
- **THEN** el frontend consulta y muestra el estado de timing del item actual y la lista de estados de timing registrados para la sesion

#### Scenario: Operar acciones manuales de timing y silencio
- **WHEN** el usuario pulsa las acciones de iniciar timing, registrar primer silencio, registrar segundo silencio o completar timing
- **THEN** el frontend llama a los endpoints de execution correspondientes y refresca el estado mostrado del item y de la sesion

## ADDED Requirements

### Requirement: UI de revisión clínica en módulo Results
El frontend MUST proveer una vista de revisión clínica dedicada para sesiones completadas en el módulo `results`, consumiendo datos reales del backend.

#### Scenario: Navegación a revisión clínica
- **WHEN** el usuario navega a la ruta de resultados
- **THEN** el frontend MUST mostrar una experiencia de revisión basada en datos persistidos y no en placeholders locales

#### Scenario: Render de resultados por sesión
- **WHEN** la vista recibe resultados de una sesión
- **THEN** el frontend MUST mostrar tabla o lista con metadatos de ítem y outcome evaluado

### Requirement: Estados de interfaz para consulta de resultados
El frontend MUST mostrar estados explícitos de carga, vacío y error para la consulta de revisión clínica.

#### Scenario: Estado cargando durante consulta
- **WHEN** la consulta al backend está en progreso
- **THEN** el frontend MUST mostrar un estado de carga visible

#### Scenario: Estado vacío en ausencia de datos
- **WHEN** no existen resultados para la sesión consultada
- **THEN** el frontend MUST mostrar un estado vacío con mensaje claro

#### Scenario: Estado de error recuperable
- **WHEN** la consulta falla por error de red o servidor
- **THEN** el frontend MUST mostrar error y una acción de reintento

## ADDED Constraints
- La UI de timing de este cambio es manual y de soporte al bootstrap, no automatiza avance entre items.
- El frontend mantiene la navegacion secuencial demo local basada en los estimulos cargados en assets.
- Todas las rutas privadas MUST estar declaradas bajo el `AuthGuard` en el módulo de routing raíz.
