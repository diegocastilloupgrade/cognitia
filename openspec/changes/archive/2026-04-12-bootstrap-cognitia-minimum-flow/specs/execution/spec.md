# Flujo mínimo de ejecución

## ADDED Requirements

### Requirement: REQ-EXECUTION-MIN-FLOW-1: Ejecucion minima de sesion con estimulos demo
El sistema MUST permitir abrir una sesion, ejecutar estimulos demo y registrar resultados simples por sesion durante el flujo minimo, incluyendo un control manual baseline de timing por item y registro de silencios sobre el item activo mostrado.

#### Scenario: Sesion se inicia, muestra estimulos y registra resultados simples
- **WHEN** desde el frontend se abre una sesion valida y se inicia la ejecucion
- **THEN** la pantalla de ejecucion muestra estimulos visuales demo cargados desde `src/assets/stimuli`, permite avanzar y retroceder entre ellos y permite registrar un resultado simple por estimulo mostrado mediante `POST /api/results/session/:sessionId`

#### Scenario: El usuario opera timing manual del item mostrado
- **WHEN** el usuario inicia el timing del item visible en ejecucion
- **THEN** el sistema registra un estado de timing con hora de inicio, duracion configurada y umbral de silencio para ese item

#### Scenario: El usuario registra silencios sobre el item activo
- **WHEN** el usuario registra un primer o segundo silencio sobre el item actualmente mostrado
- **THEN** el sistema agrega el evento de silencio correspondiente al estado de timing del item y mantiene trazabilidad por sesion e item

#### Scenario: El usuario consulta el estado de timing del item o de la sesion
- **WHEN** el frontend consulta el estado de timing del item activo o el conjunto de estados de una sesion
- **THEN** el sistema devuelve el estado actual del item y la coleccion de estados existentes para la sesion

## ADDED Constraints
- El flujo se limita a demostracion funcional de extremo a extremo.
- El control de timing y silencios en este cambio es manual y no automatiza la navegacion entre items.
- No se definen en este cambio reglas completas de timing, silencio ni scoring real.