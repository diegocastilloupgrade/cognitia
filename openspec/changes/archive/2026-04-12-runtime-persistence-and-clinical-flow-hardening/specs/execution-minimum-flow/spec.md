## MODIFIED Requirements

### Requirement: Flujo minimo de ejecucion por sesion
Una sesion MUST poder abrirse e iniciarse para ejecutar una secuencia demo de estimulos y registrar resultados por sesion durante un flujo autonomo donde el clinico solo inicia la sesion y el motor de ejecucion avanza item a item automaticamente, con capacidad de recuperar y continuar la ejecucion si la vista o el backend se reinician.

#### Scenario: Sesion se inicia y el motor controla la progresion
- **WHEN** el frontend inicia una sesion valida
- **THEN** el backend MUST establecer la sesion en ejecucion, activar el primer item, persistir el runtime inicial y devolver su estado

#### Scenario: Runtime decide siguiente item sin mediacion manual
- **WHEN** se finaliza un item con su payload de resultado
- **THEN** el backend MUST evaluar el contexto del item y devolver el siguiente item activo o el cierre de sesion

#### Scenario: Frontend renderiza estimulo activo definido por backend
- **WHEN** el backend actualiza o recupera el item activo runtime
- **THEN** el frontend MUST mostrar el estimulo correspondiente y no decidir localmente el orden de navegacion

#### Scenario: La sesion puede reanudarse tras recarga
- **WHEN** el usuario vuelve a abrir una sesion en curso
- **THEN** el sistema MUST reconstruir el flujo desde el item activo persistido sin reiniciar la sesion