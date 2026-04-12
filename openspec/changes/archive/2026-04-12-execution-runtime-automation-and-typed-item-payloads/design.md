## Contexto

El comportamiento actual de ejecución depende de acciones manuales de UI para iniciar el timing y registrar eventos de silencio por ítem. El flujo objetivo requiere inicio único de sesión, progresión autónoma del runtime y gestión automática de silencios mientras la integración de Unith en frontend aún no está disponible. Actualmente el sistema usa un tipado amplio (`data: any`) para resultados de ítems, lo que es frágil para un comportamiento de runtime guiado por reglas.

## Objetivos / No objetivos

**Objetivos:**
- Mover el control de orquestación del runtime al backend para que la progresión de ítems sea dirigida por backend.
- Soportar un contrato de eventos mock de detección de silencio que luego pueda reemplazarse por eventos reales de Unith.
- Proporcionar respuestas backend con instrucciones de feedback del avatar para situaciones de silencio.
- Definir interfaces fuertemente tipadas de payload de resultados por ítem (3.1 a 3.7) para consistencia frontend/backend.
- Mantener contratos de API lo bastante estables para evitar rediseño al pasar de fuente mock de silencio a Unith.

**No objetivos:**
- Integrar el SDK/flujo de eventos real de Unith en este cambio.
- Implementar persistencia del estado de runtime en PostgreSQL en este cambio.
- Implementar el modelo final completo de scoring clínico más allá de las estructuras actuales de payload por ítem.

## Decisiones

1. El backend posee la máquina de estados de runtime y las decisiones de transición al siguiente ítem.
- Justificación: mantiene el flujo determinista y evita duplicación de lógica de ramificación en frontend.
- Alternativa considerada: transiciones controladas por frontend con validación backend. Rechazada para evitar divergencia cliente/servidor.

2. El frontend publica eventos de runtime y renderiza decisiones del servidor.
- Justificación: el frontend permanece como capa de transporte y presentación; facilita el reemplazo de la fuente de eventos (manual/mock/Unith).
- Alternativa considerada: frontend calcula localmente umbrales de silencio. Rechazada por riesgo de deriva respecto a reglas de servidor.

3. La gestión de silencios usa un contrato mock de productor de eventos.
- Justificación: permite avanzar de inmediato antes de la disponibilidad de Unith, preservando el punto de integración futuro.
- Alternativa considerada: bloquear trabajo hasta integrar Unith. Rechazada porque bloquea la entrega del runtime autónomo.

4. El tipado de resultados por ítem se introduce en interfaces compartidas por código de ítem.
- Justificación: seguridad en compilación para finalización de runtime y validación de payload.
- Alternativa considerada: mantener JSON genérico y validar solo en runtime. Rechazada por menor seguridad para desarrollo.

5. La persistencia de runtime se mantiene en memoria por ahora, con frontera de abstracción de repositorio.
- Justificación: menor sobrecarga de implementación en esta fase y preparación para un cambio posterior de persistencia.
- Alternativa considerada: introducir ORM y migraciones ahora. Rechazada para mantener este cambio enfocado y más corto.

## Riesgos / Trade-offs

- [Riesgo] La fuente mock de silencio puede comportarse distinto a eventos reales de Unith. -> Mitigación: definir esquema estricto de eventos y frontera de adaptador en módulo de integraciones.
- [Riesgo] La orquestación backend puede aumentar la complejidad de tests de ejecución. -> Mitigación: añadir tests de integración alrededor de endpoints runtime event/finalize-item y sus resultados de transición.
- [Riesgo] Las definiciones tipadas de payload pueden no encajar totalmente con refinamientos clínicos futuros. -> Mitigación: mapear cada interfaz directamente contra campos del documento funcional actual y mantener ruta de evolución versionada.

## Plan de migración

1. Añadir servicio de orquestación de runtime y adaptador de eventos mock de silencio detrás de los endpoints actuales de ejecución.
2. Actualizar el flujo de ejecución frontend para iniciar sesión una sola vez y consumir respuestas backend de siguiente ítem/feedback.
3. Introducir interfaces de payload tipadas y adaptar modelos de petición/respuesta en backend/frontend.
4. Ejecutar tests de regresión para inicio de runtime, eventos de silencio, transiciones y finalización de ítems.
5. Mantener ruta de rollback conservando los endpoints actuales y activando por feature flag la nueva ruta de orquestación si fuese necesario.

## Preguntas abiertas

- Los valores exactos de timeout por ítem donde difieran specs y DOCX funcional (si aplica) deben reconciliarse antes de QA final.
- Definir si el texto de feedback del avatar debe generarse en servidor o seleccionarse en frontend mediante códigos de respuesta a largo plazo.
