# Execution Minimum Flow

## ADDED Requirements

### Requirement: Flujo minimo de ejecucion por sesion
Una sesion MUST poder abrirse e iniciarse para ejecutar una secuencia demo de estimulos y registrar resultados simples por item mostrado.

#### Scenario: Abrir y comenzar ejecucion de sesion
- GIVEN existe una sesion valida seleccionada
- WHEN el usuario abre la pantalla de ejecucion e inicia la sesion
- THEN el sistema habilita el recorrido de estimulos demo para esa sesion

#### Scenario: Mostrar estimulos demo secuenciales
- GIVEN la sesion esta en ejecucion
- WHEN corresponde presentar el siguiente item
- THEN el frontend visualiza el estimulo demo correspondiente desde assets

#### Scenario: Registrar resultado simple por item mostrado
- GIVEN un estimulo fue mostrado durante la ejecucion
- WHEN se captura el resultado simple del item
- THEN el frontend envia el resultado a `/api/results/session/:id` asociado a la sesion activa

## ADDED Constraints
- El flujo se limita a demostracion funcional de extremo a extremo.
- No se definen en este cambio reglas completas de timing, silencio ni scoring real.
