# Execution minimum flow

## ADDED Requirements

### Requirement: REQ-EXECUTION-MIN-FLOW-1: Ejecucion minima de sesion con estimulos demo
El sistema MUST permitir abrir una sesion, ejecutar estimulos demo y registrar resultados simples por sesion durante el flujo minimo.

#### Scenario: Sesion se inicia, muestra estimulos y registra resultados simples
- Desde el frontend se puede abrir una sesion de cribado y cambiar su estado a EN_EJECUCION.
- En la pantalla de ejecucion se muestran estimulos visuales demo cargados desde src/assets/stimuli.
- El usuario puede avanzar y retroceder entre estimulos.
- El frontend puede registrar un "resultado simple" por estimulo mostrado llamando a POST /api/results/session/:sessionId.
- El frontend puede listar los resultados registrados de la sesion llamando a GET /api/results/session/:sessionId.