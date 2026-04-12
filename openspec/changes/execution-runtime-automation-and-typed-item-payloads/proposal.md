## Por qué

El flujo de runtime actual todavía depende de acciones manuales para iniciar el timing del ítem y registrar eventos de silencio, lo que no encaja con el objetivo de que el clínico inicie el test una sola vez y que el asistente avance automáticamente de ítem en ítem. Además, necesitamos tipado real en TypeScript para los payloads de resultado por ítem para reducir ambigüedad y errores de implementación a medida que crece la lógica de ejecución.

## Qué cambia

- Añadir orquestación autónoma del runtime en el flujo de ejecución backend para que el frontend solo inicie la sesión y envíe eventos de runtime.
- Añadir flujo de gestión automática de silencios mediante un contrato de integración mock (reemplazo temporal hasta que esté disponible la integración de Unith en frontend).
- Añadir selección de siguiente ítem y finalización controladas por backend a partir de eventos de runtime.
- Añadir payloads de feedback del avatar para momentos de silencio y mostrarlos en la UI de ejecución frontend.
- Reemplazar payloads amplios con `any` por interfaces tipadas por ítem para los ítems mínimos actuales del test (3.1 a 3.7), tomando como fuente la documentación funcional.
- Mantener la persistencia del runtime en memoria en este cambio, pero definir interfaces/contratos para poder añadir persistencia en base de datos sin rediseñar endpoints.

## Capacidades

### Nuevas capacidades
- `execution-runtime-automation`: Flujo autónomo de runtime controlado por backend para inicio, gestión de eventos, transición de ítems y finalización.
- `silence-feedback-mock-flow`: Flujo mock de detección/eventos de silencio con payloads de feedback del avatar generados por backend para renderizado en UI.
- `typed-item-result-payloads`: Interfaces fuertemente tipadas para payloads de resultado de las familias de ítems 3.1 a 3.7.

### Capacidades modificadas
- `execution-minimum-flow`: Extender el comportamiento mínimo de ejecución desde controles manuales de timing hacia progresión autónoma de ítems y contratos de feedback por silencio.
- `result-payload-baseline`: Reemplazar el manejo baseline de payload genérico por tipado explícito a nivel de ítem.

## Impacto

- Módulos backend: `backend/src/modules/execution`, `backend/src/modules/results`, `backend/src/modules/integrations`.
- Módulos frontend: servicios/componentes/plantillas y estado de runtime en `frontend/src/app/features/execution`.
- Forma de API: payloads y respuestas de runtime event/finalize-item, incluyendo metadatos de siguiente ítem y feedback del avatar.
- Tests: actualización de tests de integración runtime en backend y tests de componente/servicio en frontend para el flujo autónomo.
- Dependencias: no se introduce dependencia nueva de base de datos en este cambio; la persistencia se mantiene en memoria por diseño.
