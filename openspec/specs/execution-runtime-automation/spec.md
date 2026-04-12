# Execution Runtime Automation

## ADDED Requirements

### Requirement: Orquestacion autonoma de runtime por sesion
El sistema SHALL orquestar la progresion de runtime desde backend tras el inicio de sesion, incluyendo control del item activo, procesamiento de eventos y transiciones al siguiente item sin interaccion manual del clinico durante la ejecucion.

#### Scenario: La sesion inicia y backend activa el primer item
- WHEN el cliente inicia un runtime de sesion valido
- THEN el backend SHALL establecer el primer item configurado como activo y devolver el estado runtime para su renderizado

#### Scenario: La finalizacion de item dispara la decision de siguiente item en backend
- WHEN el cliente envia un evento finalize-item con el payload de resultado del item actual
- THEN el backend SHALL persistir el resultado runtime en memoria y devolver o bien el codigo del siguiente item activo o bien el estado de sesion completada

### Requirement: Los eventos runtime se evaluan en backend por contexto de item
El sistema SHALL evaluar los eventos runtime entrantes usando el contexto del item activo actual y la configuracion de reglas del item.

#### Scenario: El evento pertenece al item activo
- WHEN un evento runtime referencia el item activo actual
- THEN el backend SHALL procesar el evento y actualizar el estado runtime de forma determinista

#### Scenario: El evento no coincide con el item activo
- WHEN un evento runtime referencia un item que no esta activo actualmente
- THEN el backend SHALL rechazar el evento y mantener el estado runtime sin cambios