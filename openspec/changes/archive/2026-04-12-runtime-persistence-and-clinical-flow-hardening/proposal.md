## Why

El runtime actual funciona para demo y validacion funcional, pero sigue dependiendo de estado en memoria y no soporta bien reinicios de proceso, recuperacion de sesiones interrumpidas ni garantias operativas suficientes para un flujo clinico real. Necesitamos cerrar esa brecha ahora para que la ejecucion sobreviva a reinicios, los resultados queden consistentes en base de datos y el clinico pueda retomar una sesion sin ambiguedades.

## What Changes

- Persistir en base de datos el estado runtime por sesion, incluyendo item activo, transiciones, silencios y estado de completitud.
- Persistir resultados de item y runtime de forma consistente, evitando divergencias entre `finalize-item`, estado activo y resultados guardados.
- Endurecer el flujo clinico para soportar reanudacion de sesion, reintentos seguros e idempotencia basica en eventos criticos de runtime.
- Exponer consultas de estado suficientemente robustas para que frontend pueda reconstruir una sesion en curso tras recarga o reinicio del backend.
- Añadir validaciones y tests de regresion sobre persistencia, recuperacion y continuidad del flujo clinico.

## Capabilities

### New Capabilities
- `runtime-persistence`: Persistencia durable del estado runtime por sesion, incluyendo item activo, silencios, transiciones y marca de finalizacion.
- `session-recovery-and-resume`: Reanudacion segura de sesiones en curso desde frontend/backend tras recarga, reinicio o interrupcion operativa.

### Modified Capabilities
- `execution-runtime-automation`: El runtime deja de depender solo de memoria en proceso y pasa a reconstruirse desde persistencia con garantias de continuidad.
- `result-payload-baseline`: El guardado de payloads de resultado se alinea con persistencia consistente e idempotencia minima en eventos de cierre de item.
- `execution-minimum-flow`: El flujo minimo pasa a soportar recarga y reanudacion de sesion sin perder el item activo ni romper la progresion clinica.

## Impact

- Backend: `backend/src/modules/execution`, `backend/src/modules/results`, `backend/src/modules/sessions` y capa de acceso a datos.
- Datos: evolucion del modelo sobre `screening_sessions` e `item_results`, y posible nueva tabla/coleccion para estado runtime persistido y eventos de silencio.
- Frontend: reconstruccion de estado de ejecucion al entrar o recargar una sesion activa.
- API: contratos de lectura de runtime y finalize-item para soportar continuidad, consistencia e idempotencia.
- Calidad: nuevos tests de integracion sobre persistencia, recuperacion de sesion y resistencia a reinicios.