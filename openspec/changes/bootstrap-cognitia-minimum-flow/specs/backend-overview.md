## ADDED Requirements

### Requirement: API minima en memoria para flujo bootstrap
El sistema MUST exponer una API minima en memoria para soportar el flujo base de pacientes, sesiones, ejecucion y resultados, sin depender de logica clinica avanzada ni integraciones externas reales.

#### Scenario: Consultar pacientes en API minima
- GIVEN el backend esta levantado con almacenamiento en memoria
- WHEN un cliente consulta el listado de pacientes
- THEN la API responde una coleccion de pacientes utilizable por frontend

#### Scenario: Gestionar sesiones en API minima
- GIVEN existe un paciente seleccionado
- WHEN el cliente crea u obtiene sesiones del paciente
- THEN la API responde una sesion valida para iniciar ejecucion

#### Scenario: Registrar resultados por sesion
- GIVEN una sesion activa con items mostrados
- WHEN el cliente envia resultados simples a `/api/results/session/:id`
- THEN la API almacena y devuelve resultados asociados a esa sesion

## ADDED Constraints
- La persistencia es en memoria para este cambio.
- No se introduce scoring real ni reglas clinicas de interpretacion.
- No se incluye integracion real con Unith en este alcance.
