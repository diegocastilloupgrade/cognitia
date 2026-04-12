# Silence Feedback Mock Flow

## ADDED Requirements

### Requirement: Los eventos mock de silencio impulsan la gestion de silencios en runtime
El sistema SHALL aceptar eventos mock de silencio a traves de endpoints de eventos runtime y gestionarlos con el mismo contrato previsto para la futura integracion con Unith.

#### Scenario: El primer evento de silencio actualiza el estado runtime
- WHEN el cliente envia un evento runtime de primer silencio para el item activo
- THEN el backend SHALL registrar el evento de silencio y devolver el estado runtime actualizado con el conteo de silencios

#### Scenario: El segundo evento de silencio dispara metadatos de escalado
- WHEN el cliente envia un evento runtime de segundo silencio para el item activo
- THEN el backend SHALL registrar metadatos de escalado para ese item en el estado runtime

### Requirement: Backend proporciona payload de feedback del avatar ante silencios
El sistema SHALL devolver payloads estructurados de feedback del avatar tras eventos de silencio para que el frontend pueda renderizar mensajes durante la ejecucion.

#### Scenario: Un evento de silencio produce payload de feedback
- WHEN se acepta un evento de silencio
- THEN el backend SHALL incluir en la respuesta runtime un payload de feedback que contenga codigo de mensaje y texto de visualizacion