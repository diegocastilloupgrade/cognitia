# Execution Minimum Flow

## ADDED Requirements

### Requirement: Flujo minimo de ejecucion por sesion
Una sesion MUST poder abrirse e iniciarse para ejecutar una secuencia demo de estimulos y registrar resultados por sesion durante un flujo autonomo donde el clinico solo inicia la sesion y el motor de ejecucion avanza item a item automaticamente, con capacidad de recuperar y continuar la ejecucion si la vista o el backend se reinician, y dejando los artefactos de resultados necesarios para una revisión clínica posterior.

#### Scenario: Sesion se inicia y el motor controla la progresion
- WHEN el frontend inicia una sesion valida
- THEN el backend MUST establecer la sesion en ejecucion, activar el primer item, persistir el runtime inicial y devolver su estado

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

## ADDED Constraints
- El flujo se limita a demostracion funcional de extremo a extremo.
- No se definen en este cambio reglas completas de scoring real ni persistencia definitiva en base de datos relacional.
