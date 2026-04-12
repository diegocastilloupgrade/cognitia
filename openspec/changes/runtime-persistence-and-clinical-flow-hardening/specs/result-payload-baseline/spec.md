## MODIFIED Requirements

### Requirement: Payload baseline generico para resultados por item
El sistema MUST aceptar y manejar un payload baseline por item dentro de una sesion con tipado explicito por codigo de item, manteniendo `sessionId`, `itemCode`, `positionInSession` y `evaluatedOutcome` como metadatos comunes, y persistiendo ese resultado de forma consistente con la transicion runtime asociada.

#### Scenario: Registrar payload por item con tipado especifico
- **WHEN** el cliente envia un resultado para un item soportado (3.1 a 3.7)
- **THEN** el backend MUST aceptar el resultado solo si `data` cumple la interfaz tipada correspondiente al `itemCode`

#### Scenario: Consultar resultados por sesion preservando tipo de item
- **WHEN** el cliente consulta resultados por `sessionId`
- **THEN** obtiene entradas con metadatos baseline y `data` estructurado segun el item registrado

#### Scenario: Resultado y transicion runtime se guardan de forma consistente
- **WHEN** se completa un item mediante `finalize-item`
- **THEN** el backend MUST evitar que el resultado quede persistido sin la transicion runtime asociada o viceversa