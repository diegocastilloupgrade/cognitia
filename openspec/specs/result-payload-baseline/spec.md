# Result Payload Baseline

## ADDED Requirements

### Requirement: Payload baseline generico para resultados por item
El sistema MUST aceptar y manejar un payload baseline generico para registrar resultados por item dentro de una sesion.

Estructura baseline esperada:
- `sessionId`: identificador de sesion.
- `itemCode`: codigo del item/estimulo evaluado.
- `positionInSession`: posicion secuencial del item dentro de la sesion.
- `evaluatedOutcome`: resultado evaluado en formato simple/generico.
- `data`: objeto libre con metadatos o evidencia basica del item.

#### Scenario: Registrar payload baseline valido
- GIVEN una sesion activa y un item mostrado
- WHEN el cliente envia un resultado con `sessionId`, `itemCode`, `positionInSession`, `evaluatedOutcome` y `data`
- THEN el backend registra el resultado como entrada valida del baseline

#### Scenario: Consultar resultados por sesion con payload baseline
- GIVEN existen resultados registrados para una sesion
- WHEN el cliente consulta resultados por `sessionId`
- THEN obtiene entradas que conservan la estructura baseline generica

## ADDED Constraints
- `data` permanece generico en este cambio y no impone tipado clinico especifico por item.
- `evaluatedOutcome` se mantiene en nivel simple, sin scoring ni interpretacion clinica avanzada.
