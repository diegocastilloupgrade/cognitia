# Execution Minimum Flow

## ADDED Requirements

### Requirement: Flujo minimo de ejecucion por sesion
Una sesion MUST poder abrirse e iniciarse para ejecutar una secuencia demo de estimulos y registrar resultados por sesion durante un flujo autonomo donde el clinico solo inicia la sesion y el motor de ejecucion avanza item a item automaticamente.

#### Scenario: Sesion se inicia y el motor controla la progresion
- WHEN el frontend inicia una sesion valida
- THEN el backend MUST establecer la sesion en ejecucion, activar el primer item y devolver el estado runtime inicial

#### Scenario: Runtime decide siguiente item sin mediacion manual
- WHEN se finaliza un item con su payload de resultado
- THEN el backend MUST evaluar el contexto del item y devolver el siguiente item activo o el cierre de sesion

#### Scenario: Frontend renderiza estimulo activo definido por backend
- WHEN el backend actualiza el item activo runtime
- THEN el frontend MUST mostrar el estimulo correspondiente y no decidir localmente el orden de navegacion

## ADDED Constraints
- El flujo se limita a demostracion funcional de extremo a extremo.
- No se definen en este cambio reglas completas de scoring real ni persistencia definitiva de runtime.
