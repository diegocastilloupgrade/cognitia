## Contexto

El backend ya persiste runtime y resultados por ítem en un store JSON durable, y expone consulta de resultados por sesión. El flujo de ejecución ya puede finalizar y persistir payloads tipados, pero la funcionalidad dedicada de revisión en Angular sigue como marcador de posición y no ofrece navegación, filtrado ni interpretación a nivel de sesión orientada al clínico.

Este cambio cruza frontend (módulo `results`, enrutamiento y contratos de servicios API) y comportamiento de lectura de resultados en backend (forma de consulta y soporte de agregaciones). También impacta capacidades de OpenSpec vinculadas al cierre de ejecución e interpretación de resultados.

Restricciones:
- Preservar el mecanismo de persistencia actual (store JSON durable) en esta iteración.
- Evitar romper el comportamiento existente de automatización del runtime de ejecución.
- Mantener la salida de revisión explicable y mínima para un flujo clínico de prototipo.

Actores involucrados:
- Usuarios clínicos que realizan interpretación posterior a la sesión.
- Producto/QA validando AC-06 y la trazabilidad desde ejecución hasta revisión.

## Objetivos / No objetivos

**Objetivos:**
- Entregar un flujo end-to-end de revisión clínica basado en datos reales persistidos.
- Proveer revisión a nivel de sesión con detalle por ítem e indicadores agregados básicos.
- Proveer comportamiento predecible del frontend para estados de carga/vacío/error/reintento.
- Alinear contratos API y pruebas para que el comportamiento de revisión sea estable y resistente a regresiones.

**No objetivos:**
- Analítica avanzada o reportes longitudinales entre múltiples pacientes.
- Migración a un nuevo motor de almacenamiento (PostgreSQL sigue como alcance futuro).
- Algoritmos de scoring clínico completos más allá de los agregados baseline requeridos por el prototipo.

## Decisiones

1. Mantener el modelo de lectura de backend centrado en endpoints por sesión.
- Decisión: Usar y extender `/results/session/:sessionId` como fuente canónica para datos de revisión por ítem, y añadir un endpoint liviano de resumen de revisión por sesión si la interfaz necesita metadatos agregados.
- Justificación: Encaja con el modelo de datos actual y evita rediseñar prematuramente la persistencia.
- Alternativa considerada: Introducir desde cero una API de revisión totalmente desnormalizada; descartada por complejidad y duplicación.

2. Construir un modelo de lectura de revisión dedicado en frontend dentro de `results`.
- Decisión: Reemplazar el comportamiento de marcador de posición `Promise.resolve([])` por servicios HTTP tipados y modelos de vista para listado/detalle y tarjetas de agregados.
- Justificación: Mantiene la composición de interfaz independiente de los payloads de transporte y mejora la testabilidad.
- Alternativa considerada: Vincular componentes directamente a payloads crudos de API; descartada por acoplamiento y templates frágiles.

3. Las métricas agregadas se calculan de forma determinística desde payloads tipados persistidos.
- Decisión: Derivar indicadores agregados baseline en backend (preferido cuando se reutilizan) o en un mapper puro compartido de frontend cuando no haga falta cambiar endpoints.
- Justificación: Mantiene consistencia con el baseline de payload tipado y evita cálculos ad hoc solo en interfaz.
- Alternativa considerada: Cálculos manuales por template en código de componente; descartada por ser propensa a errores.

4. Estandarizar la máquina de estados de revisión a nivel de interfaz.
- Decisión: Definir estados explícitos (`inactivo`, `cargando`, `listo`, `vacío`, `error`) y renderizar por estado.
- Justificación: Elimina comportamiento ambiguo y mejora la confianza del usuario.
- Alternativa considerada: Estado implícito por longitud de arreglos y flags de error; descartada por mantenibilidad.

5. Preservar compatibilidad hacia atrás del flujo de ejecución actual.
- Decisión: Cualquier campo nuevo de backend para resumen de revisión debe ser aditivo y opcional.
- Justificación: Las pantallas actuales de ejecución ya consumen payloads de resultados y deben permanecer sin impacto.
- Alternativa considerada: Reemplazar la forma actual de respuesta de resultados; descartada por riesgo innecesario.

## Riesgos / Trade-offs

- [Riesgo] La interpretación agregada puede ser clínicamente engañosa si se simplifica en exceso. -> Mitigación: mantener etiquetas explícitas como indicadores de prototipo y documentar fórmulas en specs.
- [Riesgo] Deriva de contrato frontend/backend para payloads tipados y agregados. -> Mitigación: añadir pruebas de contrato de endpoint y pruebas de mapeo de componentes.
- [Riesgo] Mayor latencia al calcular resúmenes on-demand para sesiones grandes. -> Mitigación: limitar alcance actual a tamaños de payload de sesión y reevaluar con resúmenes precomputados persistidos en el futuro.
- [Trade-off] El diseño aditivo de endpoints puede mantener cierta redundancia de payload. -> Mitigación: aceptar redundancia de corto plazo para mantener compatibilidad y reducir riesgo de migración.

## Plan de migración

1. Actualizar los delta specs de OpenSpec para flujo de revisión, baseline de payload de resultados, flujo mínimo de ejecución y comportamiento de frontend.
2. Implementar cambios aditivos de contrato de lectura en backend (si aplica) y pruebas unitarias.
3. Reemplazar servicio/componente de marcador de posición de resultados en frontend por integración API tipada e interfaz con estados.
4. Añadir pruebas de frontend para estados cargando/vacío/error/listo y render de detalle de revisión.
5. Validar flujo end-to-end con la salida actual de ejecución y ejecutar pruebas completas de backend/frontend.

Estrategia de rollback:
- Revertir el módulo de resultados de frontend a la revisión previa de rutas/módulo.
- Mantener protegidos los campos aditivos en backend; si se requiere rollback, ignorar campos nuevos preservando el comportamiento original de endpoints.

## Preguntas abiertas

- ¿Los indicadores agregados deben persistirse durante el cierre de sesión o calcularse en lectura en esta iteración?
- ¿Se necesita paginación ahora para listados de revisión, o puede diferirse hasta la migración a PostgreSQL?
- ¿AC-06 debe exigir agrupación por paciente en esta fase o mantenerse solo a nivel de sesión?
