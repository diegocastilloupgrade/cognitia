## MODIFIED Requirements

### Requirement: Orquestacion autonoma de runtime por sesion
El sistema SHALL orquestar la progresion de runtime desde backend tras el inicio de sesion, incluyendo control del item activo, procesamiento de eventos y transiciones al siguiente item sin interaccion manual del clinico durante la ejecucion, aun cuando el proceso backend se reinicie o la sesion deba reconstruirse desde persistencia.

#### Scenario: La sesion inicia y backend activa el primer item
- **WHEN** el cliente inicia un runtime de sesion valido
- **THEN** el backend SHALL establecer el primer item configurado como activo, persistir ese estado runtime y devolverlo para su renderizado

#### Scenario: La finalizacion de item dispara la decision de siguiente item en backend
- **WHEN** el cliente envia un evento finalize-item con el payload de resultado del item actual
- **THEN** el backend SHALL persistir de forma consistente el resultado, actualizar el runtime y devolver o bien el codigo del siguiente item activo o bien el estado de sesion completada

#### Scenario: El runtime se reconstruye tras reinicio
- **WHEN** una sesion en curso vuelve a consultarse despues de un reinicio del backend
- **THEN** el sistema SHALL reconstruir el runtime desde persistencia y mantener el item activo correcto