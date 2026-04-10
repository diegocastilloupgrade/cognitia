# Frontend minimum flow

## ADDED Requirements

### Requirement: REQ-FRONTEND-MIN-FLOW-1: SPA Angular conectada al backend minimo
El sistema MUST proveer una SPA Angular conectada al backend minimo para operar pacientes, sesiones y navegacion a ejecucion.

#### Scenario: Frontend consume patients, sessions y execution
- El frontend es una SPA Angular.
- El frontend consume /api/patients para listar y crear pacientes.
- El frontend consume /api/sessions para listar y crear sesiones.
- El frontend permite abrir una sesion y navegar a una pantalla de ejecucion de sesion conectada al backend.