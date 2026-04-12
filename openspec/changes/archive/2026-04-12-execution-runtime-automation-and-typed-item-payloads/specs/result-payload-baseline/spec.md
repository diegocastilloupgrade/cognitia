## MODIFIED Requirements

### Requirement: Payload baseline generico para resultados por item
El sistema MUST aceptar y manejar un payload baseline por item dentro de una sesion con tipado explicito por codigo de item, manteniendo `sessionId`, `itemCode`, `positionInSession` y `evaluatedOutcome` como metadatos comunes.

#### Scenario: Registrar payload por item con tipado especifico
- **WHEN** el cliente envia un resultado para un item soportado (3.1 a 3.7)
- **THEN** el backend MUST aceptar el resultado solo si `data` cumple la interfaz tipada correspondiente al `itemCode`

#### Scenario: Consultar resultados por sesion preservando tipo de item
- **WHEN** el cliente consulta resultados por `sessionId`
- **THEN** obtiene entradas con metadatos baseline y `data` estructurado segun el item registrado

## REMOVED Requirements

### Requirement: data permanece generico sin tipado clinico por item
**Reason**: El runtime ahora requiere estructuras deterministas específicas por ítem para soportar transiciones autónomas y un manejo de resultados más seguro.
**Migration**: Reemplazar el manejo genérico `data: any` por interfaces discriminadas por ítem y mapear payloads heredados a las nuevas estructuras específicas por ítem antes de las llamadas finalize-item.
