## Context

El cambio bootstrap-cognitia-minimum-flow consolida un flujo funcional extremo a extremo entre backend y frontend con persistencia en memoria para validar integración temprana. El estado actual implementado incluye APIs mínimas de pacientes/sesiones/resultados, pantalla de ejecución con estímulos demo, registro simple de resultados y un baseline manual de timing y silencios por ítem. El alcance está restringido a demostración técnica operativa, sin scoring clínico avanzado ni integración real con Unith.

Stakeholders principales:
- Producto y clínica: necesitan validar el recorrido funcional completo.
- Equipo backend/frontend: necesita contratos estables para iterar en bloques posteriores.
- QA: necesita un baseline verificable para regresión inicial.

Restricciones clave:
- Estado en memoria (sin persistencia en base de datos).
- Navegación demo secuencial en frontend.
- Flujo de timing/silencios manual (no autónomo).

## Goals / Non-Goals

**Goals:**
- Establecer un baseline ejecutable y observable para pacientes, sesiones, ejecución y resultados.
- Definir contratos API mínimos claros entre backend y frontend para el flujo bootstrap.
- Incorporar trazabilidad mínima de timing y silencios por ítem como soporte operativo.
- Mantener una base suficientemente simple para permitir iteraciones rápidas en cambios posteriores.

**Non-Goals:**
- Implementar scoring clínico completo o interpretación clínica final.
- Automatizar la progresión entre ítems o la detección real de silencios desde Unith.
- Introducir persistencia definitiva en base de datos en este bloque.
- Cerrar el tipado completo por ítem para todos los reactivos clínicos.

## Decisions

1. Arquitectura en memoria para el baseline.
- Decisión: mantener repositorios/estado en memoria para sesiones, resultados y timing.
- Justificación: minimiza fricción de infraestructura y acelera validación temprana del flujo.
- Alternativa considerada: persistencia inmediata en PostgreSQL. Rechazada por coste y por ampliar innecesariamente el alcance del bootstrap.

2. Separación de capacidades por módulos backend y feature de ejecución frontend.
- Decisión: mantener separación por módulos backend (auth/patients/sessions/results/execution) y flujo de ejecución frontend dedicado.
- Justificación: facilita pruebas e iteración incremental por dominio.
- Alternativa considerada: consolidar lógica de ejecución en módulos más amplios. Rechazada por menor claridad y mayor acoplamiento.

3. Timing y silencios manuales como baseline funcional.
- Decisión: exponer endpoints de start/silence/complete/state y UI manual para operarlos.
- Justificación: permite validar contrato y trazabilidad antes de introducir orquestación autónoma.
- Alternativa considerada: esperar a integración Unith para iniciar timing/silencios. Rechazada por bloquear validación funcional temprana.

4. Payload de resultados con baseline genérico en este bloque.
- Decisión: mantener payload base con data flexible y abrir tipado clínico detallado para un cambio posterior.
- Justificación: reduce complejidad en el bootstrap y mantiene foco en conectividad funcional.
- Alternativa considerada: tipado clínico completo desde el inicio. Rechazada por ampliar en exceso alcance y dependencia de definiciones funcionales detalladas.

## Risks / Trade-offs

- [Riesgo] El comportamiento en memoria no representa escenarios reales de persistencia. -> Mitigación: documentar explícitamente el límite y planificar migración de persistencia en cambio posterior.
- [Riesgo] El control manual de timing/silencios puede generar diferencias respecto al flujo objetivo autónomo. -> Mitigación: fijar contratos de API reutilizables y separar claramente baseline manual vs runtime autónomo.
- [Riesgo] Payload genérico puede ocultar errores de estructura por ítem. -> Mitigación: mover tipado fuerte por ítem al siguiente change y añadir pruebas de contrato.

## Migration Plan

1. Mantener este baseline como referencia estable de integración end-to-end.
2. Usar los endpoints y estado de timing/silencios manual como punto de partida para el cambio de runtime autónomo.
3. Introducir tipado por ítem y reglas de transición avanzadas en el change execution-runtime-automation-and-typed-item-payloads.
4. Planificar migración de persistencia y Unith real en bloques posteriores, sin romper los contratos validados en bootstrap.

## Open Questions

- Confirmar priorización exacta entre tipado por ítem, scoring baseline e integración Unith real en la siguiente iteración.
- Definir qué parte del scoring mínimo debe quedar en backend dentro del siguiente bloque para no contaminar el bootstrap.
- Establecer criterio de cierre formal del bootstrap cuando se archive: solo baseline técnico o baseline técnico más trazabilidad clínica mínima.
