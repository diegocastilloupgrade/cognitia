# Tasks: bootstrap-cognitia-minimum-flow

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
- [ ] Definir payloads tipados por item (contrato por tipo de estimulo/reactivo).
- [ ] Incorporar reglas de timing base (inicio, duracion, expiracion por item).
- [ ] Incorporar manejo de silencio/no respuesta en el flujo de ejecucion.
- [ ] Definir baseline de scoring (sin logica clinica avanzada).
- [ ] Agregar pruebas unitarias minimas en backend y frontend para flujo bootstrap.
- [ ] Sustituir mock/simulacion por integracion real con Unith.
