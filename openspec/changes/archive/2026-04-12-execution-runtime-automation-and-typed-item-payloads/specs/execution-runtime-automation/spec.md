## ADDED Requirements

### Requirement: Orquestación autónoma de runtime por sesión
El sistema SHALL orquestar la progresión de runtime desde backend tras el inicio de sesión, incluyendo control del ítem activo, procesamiento de eventos y transiciones al siguiente ítem sin interacción manual del clínico durante la ejecución.

#### Scenario: La sesión inicia y backend activa el primer ítem
- **WHEN** el cliente inicia un runtime de sesión válido
- **THEN** el backend SHALL establecer el primer ítem configurado como activo y devolver el estado runtime para su renderizado

#### Scenario: La finalización de ítem dispara la decisión de siguiente ítem en backend
- **WHEN** el cliente envía un evento finalize-item con el payload de resultado del ítem actual
- **THEN** el backend SHALL persistir el resultado runtime en memoria y devolver o bien el código del siguiente ítem activo o bien el estado de sesión completada

### Requirement: Los eventos runtime se evalúan en backend por contexto de ítem
El sistema SHALL evaluar los eventos runtime entrantes usando el contexto del ítem activo actual y la configuración de reglas del ítem.

#### Scenario: El evento pertenece al ítem activo
- **WHEN** un evento runtime referencia el ítem activo actual
- **THEN** el backend SHALL procesar el evento y actualizar el estado runtime de forma determinista

#### Scenario: El evento no coincide con el ítem activo
- **WHEN** un evento runtime referencia un ítem que no está activo actualmente
- **THEN** el backend SHALL rechazar el evento y mantener el estado runtime sin cambios
