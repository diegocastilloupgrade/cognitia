## MODIFIED Requirements

### Requirement: El runtime de sesion MUST persistirse de forma durable en PostgreSQL
El sistema MUST persistir por sesion el estado runtime necesario para continuidad operacional en PostgreSQL, incluyendo item activo, estado general de runtime, timestamps relevantes y estado de timing/silencios por item.

#### Scenario: Crear estado persistido al iniciar runtime
- **WHEN** se inicia una sesion valida para ejecucion
- **THEN** el backend MUST crear o actualizar un estado runtime persistido en PostgreSQL asociado a esa sesion con el primer item activo

#### Scenario: Actualizar runtime persistido tras evento valido
- **WHEN** se procesa un evento runtime valido para el item activo
- **THEN** el backend MUST persistir el nuevo estado runtime en PostgreSQL antes de responder al cliente

### Requirement: El runtime persistido MUST poder reconstruirse tras reinicio
El sistema MUST ser capaz de reconstruir el estado runtime de una sesion en curso desde almacenamiento durable en PostgreSQL sin depender de memoria de proceso previa.

#### Scenario: Backend se reinicia con sesiones en curso
- **WHEN** el cliente consulta una sesion que estaba en ejecucion antes del reinicio
- **THEN** el backend MUST recuperar su estado runtime persistido en PostgreSQL y devolver el item activo correcto
