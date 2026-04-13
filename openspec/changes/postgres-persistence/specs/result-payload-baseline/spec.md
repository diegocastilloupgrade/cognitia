## MODIFIED Requirements

### Requirement: Payload baseline generico para resultados por item
El sistema MUST aceptar y manejar un payload baseline por item dentro de una sesion con tipado explicito por codigo de item, manteniendo `sessionId`, `itemCode`, `positionInSession` y `evaluatedOutcome` como metadatos comunes, persistiendo ese resultado en PostgreSQL de forma consistente con la transicion runtime asociada y exponiendolo para su consumo en la revisión clínica de sesiones completadas.

#### Scenario: Registrar payload por item con tipado especifico
- WHEN el cliente envia un resultado para un item soportado (3.1 a 3.7)
- THEN el backend MUST aceptar el resultado solo si `data` cumple la interfaz tipada correspondiente al `itemCode`

#### Scenario: Consultar resultados por sesion preservando tipo de item
- WHEN el cliente consulta resultados por `sessionId`
- THEN obtiene entradas con metadatos baseline y `data` estructurado segun el item registrado

#### Scenario: Resultado y transicion runtime se guardan de forma consistente
- WHEN se completa un item mediante `finalize-item`
- THEN el backend MUST evitar que el resultado quede persistido en PostgreSQL sin la transicion runtime asociada o viceversa

#### Scenario: Resultados baseline son consumibles para revisión clínica
- WHEN un módulo de revisión solicita resultados de una sesión completada
- THEN el sistema MUST entregar un payload consistente y suficiente para renderizar detalle por ítem sin inferencias implícitas del cliente

## ADDED Constraints
- El baseline mantiene metadatos comunes compartidos entre items.
- `data` deja de ser libre y pasa a estar gobernado por contratos tipados por item y una persistencia SQL consistente con runtime.
