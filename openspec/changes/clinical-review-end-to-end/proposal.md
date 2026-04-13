## Motivo

El prototipo ya persiste resultados por ítem y estado de runtime, pero la experiencia dedicada de revisión clínica sigue incompleta y no cumple el criterio de aceptación del producto para revisión posterior a la sesión. Debe abordarse ahora para cerrar el ciclo funcional entre ejecución de sesión e interpretación clínica.

## Cambios

- Implementar el flujo de extremo a extremo de revisión clínica usando datos reales del backend en lugar de lógica de marcador de posición en el módulo de resultados.
- Añadir visualización de resultados a nivel de sesión con detalle por ítem e indicadores agregados básicos útiles para revisión clínica.
- Añadir comportamiento de consulta y filtrado para localizar rápidamente sesiones completadas relevantes.
- Definir estados consistentes de vacío/carga/error en las pantallas de revisión para que el comportamiento sea predecible y testeable.
- Añadir pruebas automatizadas que validen el comportamiento de revisión desde el contrato API hasta el renderizado de Angular.

## Capacidades

### Nuevas capacidades
- `clinical-review-workflow`: Flujo de extremo a extremo de revisión clínica para sesiones completadas, incluyendo consulta, visualización y filtrado de resultados persistidos.

### Capacidades modificadas
- `result-payload-baseline`: Extender los requisitos de acceso y presentación de resultados para que los payloads persistidos por ítem sean consumibles en pantallas dedicadas de revisión.
- `execution-minimum-flow`: Extender los requisitos de finalización para garantizar la salida necesaria para el flujo de revisión clínica.
- `frontend`: Añadir requisitos de estados de interfaz de revisión y comportamiento de navegación para análisis de sesiones completadas.

## Impacto

- Módulo frontend: `frontend/src/app/features/results` (servicios, componentes, rutas, pruebas).
- Módulo backend: `backend/src/modules/results` (ajustes de contrato de consulta/lectura si se requieren para la UX de revisión).
- Posibles ajustes del contrato API para endpoints de listado/detalle de revisión y campos agregados.
- Actualizaciones de OpenSpec en capacidades de revisión, payload de resultados y flujo de ejecución para mantener requisitos alineados con la implementación.
