## ADDED Requirements

### Requirement: Frontend Angular conectado a API minima
La aplicacion frontend MUST consumir la API minima existente para presentar pacientes, sesiones y el flujo de ejecucion bootstrap.

#### Scenario: Visualizar pacientes desde backend
- GIVEN el frontend esta configurado con la URL del backend
- WHEN se carga la vista de pacientes
- THEN se muestran pacientes obtenidos desde la API

#### Scenario: Visualizar y seleccionar sesiones
- GIVEN existe un paciente y sesiones disponibles
- WHEN el usuario navega al flujo de sesiones
- THEN el frontend muestra sesiones provenientes de la API y permite avanzar a ejecucion

#### Scenario: Ejecutar flujo minimo con estimulos demo
- GIVEN existe una sesion abierta
- WHEN el usuario inicia ejecucion
- THEN el frontend muestra estimulos demo y envia resultados simples por sesion

## ADDED Constraints
- El frontend usa el flujo minimo actual sin logica clinica avanzada.
- Los estimulos utilizados en este cambio son demo desde `src/assets/stimuli`.
