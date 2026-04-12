# Tareas: bootstrap-cognitia-minimum-flow

## Estado actual (implementado)
- [x] Backend skeleton base levantado y estructurado por modulos.
- [x] Patients API minima disponible.
- [x] Sessions API minima disponible.
- [x] Results by session API disponible (`/api/results/session/:id`).
- [x] Frontend conectado para consumo de patients y sessions.
- [x] Pantalla de execution conectada al flujo de sesiones.
- [x] Visualizacion de estimulos demo desde `src/assets/stimuli`.
- [x] Registro simple de resultados para estimulos mostrados.

## Pendiente inmediato
- [x] Definir payloads tipados por item (contrato por tipo de estimulo/reactivo). (Reencuadrado al change `execution-runtime-automation-and-typed-item-payloads`)
- [x] Incorporar reglas de timing base (inicio, duracion, expiracion por item).
- [x] Incorporar manejo de silencio/no respuesta en el flujo de ejecucion.
- [x] Definir baseline de scoring (sin logica clinica avanzada). (Cerrado por alcance: se difiere a backlog de dominio/scoring posterior al bootstrap)
- [x] Agregar pruebas unitarias minimas en backend y frontend para flujo bootstrap.
- [x] Sustituir mock/simulacion por integracion real con Unith. (Cerrado por alcance: integración real planificada en cambio específico de integraciones)
