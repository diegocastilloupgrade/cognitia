## MODIFIED Requirements

### Requirement: Flujo minimo de ejecucion por sesion
Una sesion MUST poder abrirse e iniciarse para ejecutar una secuencia demo de estimulos y registrar resultados por sesion durante un flujo autonomo donde el clinico solo inicia la sesion y el motor de ejecucion avanza item a item automaticamente, con capacidad de recuperar y continuar la ejecucion si la vista o el backend se reinician, dejando los artefactos de resultados necesarios para una revisión clínica posterior, y con todos los endpoints de ejecución protegidos por autenticación y respaldados por persistencia PostgreSQL.

#### Scenario: Sesion se inicia y el motor controla la progresion
- WHEN el frontend inicia una sesion valida con token válido
- THEN el backend MUST establecer la sesion en ejecucion, activar el primer item, persistir el runtime inicial en PostgreSQL y devolver su estado

#### Scenario: Runtime decide siguiente item sin mediacion manual
- WHEN se finaliza un item con su payload de resultado
- THEN el backend MUST evaluar el contexto del item y devolver el siguiente item activo o el cierre de sesion

#### Scenario: Frontend renderiza estimulo activo definido por backend
- WHEN el backend actualiza o recupera el item activo runtime
- THEN el frontend MUST mostrar el estimulo correspondiente y no decidir localmente el orden de navegacion

#### Scenario: La sesion puede reanudarse tras recarga
- WHEN el usuario vuelve a abrir una sesion en curso
- THEN el sistema MUST reconstruir el flujo desde el item activo persistido sin reiniciar la sesion

#### Scenario: Sesion completada queda lista para revisión
- WHEN el runtime finaliza el último item de la sesión
- THEN el sistema MUST garantizar que los resultados persistidos de la sesión estén disponibles para consumo inmediato de revisión clínica

#### Scenario: Endpoint de ejecución rechaza petición sin token
- WHEN se envía una petición a cualquier endpoint de ejecución sin cabecera de autorización válida
- THEN el backend MUST responder con HTTP 401 sin procesar la operación

## ADDED Constraints
- El flujo se limita a demostracion funcional de extremo a extremo.
- El almacenamiento durable del flujo mínimo se realiza sobre PostgreSQL.
- No se definen en este cambio reglas completas de scoring real.
