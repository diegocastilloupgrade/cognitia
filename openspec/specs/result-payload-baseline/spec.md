# Result Payload Baseline

## ADDED Requirements

### Requirement: Payload baseline generico para resultados por item
El sistema MUST aceptar y manejar un payload baseline por item dentro de una sesion con tipado explicito por codigo de item, manteniendo `sessionId`, `itemCode`, `positionInSession` y `evaluatedOutcome` como metadatos comunes.

#### Scenario: Registrar payload por item con tipado especifico
- WHEN el cliente envia un resultado para un item soportado (3.1 a 3.7)
- THEN el backend MUST aceptar el resultado solo si `data` cumple la interfaz tipada correspondiente al `itemCode`

#### Scenario: Consultar resultados por sesion preservando tipo de item
- WHEN el cliente consulta resultados por `sessionId`
- THEN obtiene entradas con metadatos baseline y `data` estructurado segun el item registrado

## ADDED Constraints
- El baseline mantiene metadatos comunes compartidos entre items.
- `data` deja de ser libre y pasa a estar gobernado por contratos tipados por item.
