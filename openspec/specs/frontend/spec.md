## Purpose

Definir los requisitos base del frontend Angular para consumir la API mínima de COGNITIA y operar el flujo bootstrap, incluyendo UI manual de timing/silencios en ejecución.

## Requirements

### Requirement: REQ-FRONTEND-MIN-FLOW-1: SPA Angular conectada al backend minimo
El sistema MUST proveer una SPA Angular conectada al backend minimo para operar pacientes, sesiones y navegacion a ejecucion.

#### Scenario: Frontend consume patients, sessions y execution
- El frontend es una SPA Angular.
- El frontend consume /api/patients para listar y crear pacientes.
- El frontend consume /api/sessions para listar y crear sesiones.
- El frontend permite abrir una sesion y navegar a una pantalla de ejecucion de sesion conectada al backend.

### Requirement: REQ-FRONTEND-EXECUTION-TIMING-1: UI baseline de timing y silencios en ejecucion
El sistema MUST proveer en la pantalla de ejecucion una UI baseline para consultar y operar el estado manual de timing y silencios del item visible.

#### Scenario: Visualizar timing del item actual
- **WHEN** el usuario abre la pantalla de ejecucion con una sesion valida
- **THEN** el frontend consulta y muestra el estado de timing del item actual y la lista de estados de timing registrados para la sesion

#### Scenario: Operar acciones manuales de timing y silencio
- **WHEN** el usuario pulsa las acciones de iniciar timing, registrar primer silencio, registrar segundo silencio o completar timing
- **THEN** el frontend llama a los endpoints de execution correspondientes y refresca el estado mostrado del item y de la sesion

## ADDED Constraints
- La UI de timing de este cambio es manual y de soporte al bootstrap, no automatiza avance entre items.
- El frontend mantiene la navegacion secuencial demo local basada en los estimulos cargados en assets.
