## Context

El estado runtime actual vive en memoria dentro del modulo de ejecucion backend. Ese enfoque ha sido suficiente para bootstrap y demo funcional, pero rompe continuidad al reiniciar el proceso, impide reanudar sesiones de forma fiable y deja huecos entre el estado activo del runtime y los resultados persistidos por item. El siguiente salto del producto exige mover el runtime a persistencia durable y definir un flujo clinico mas resistente a recargas, retries e interrupciones operativas.

## Goals / Non-Goals

**Goals:**
- Persistir el estado runtime por sesion con reconstruccion fiable tras reinicio de backend.
- Asegurar consistencia entre `finalize-item`, resultado persistido y siguiente item activo.
- Permitir a frontend recuperar y reanudar una sesion en curso sin perder contexto clinico.
- Introducir idempotencia basica en operaciones criticas de runtime para evitar duplicidades por reintentos.
- Cubrir el flujo con tests de integracion y recuperacion.

**Non-Goals:**
- No introducir aun scoring clinico definitivo ni reglas diagnosticas.
- No resolver todavia sincronizacion multi-dispositivo o concurrencia distribuida avanzada.
- No sustituir en este change el productor mock de silencio por integracion real con Unith.

## Decisions

### 1. Persistir runtime como agregado por sesion en almacenamiento durable
En esta iteracion se persistira un agregado de runtime por `screening_session` en un store JSON durable de backend, con `activeItemCode`, estado general, timestamps y estructura de timing/silencios por item. Esta decision reduce la dispersion de estado y facilita reconstruir una sesion completa con una sola lectura logica sin introducir aun una dependencia de base de datos relacional adicional.

Alternativas consideradas:
- Persistir solo eventos y reconstruir siempre por replay: mas flexible, pero innecesariamente complejo para el estado actual del producto.
- Mantener memoria y hacer snapshots periodicos: insuficiente para garantizar recuperacion simple y consistente.
- Introducir ya una base de datos relacional completa: valida a medio plazo, pero excesiva para esta iteracion respecto al nivel de madurez actual del backend.

### 2. Mantener `item_results` como fuente de payload clinico y separar el estado runtime operacional
Los payloads de resultado por item seguiran en `item_results`, mientras que el estado runtime persistido almacenara lo necesario para continuidad operacional. Esta separacion evita mezclar semantica clinica con estado transitorio de ejecucion.

Alternativas consideradas:
- Unificar runtime y resultados en una sola tabla JSONB: simplifica algunas escrituras, pero complica auditoria, consultas y evolucion de contratos.

### 3. Hacer `finalize-item` transaccional a nivel de persistencia
La finalizacion de item debe guardar resultado, marcar item completado y decidir/persistir el siguiente item activo dentro de una unica unidad consistente. Si cualquiera de esos pasos falla, el runtime no debe quedar a medio actualizar.

Alternativas consideradas:
- Encadenar escrituras separadas con compensacion manual: mas fragil y propenso a estados intermedios inconsistentes.

### 4. Exponer un endpoint de recuperacion de runtime apto para reconstruccion de UI
Frontend consumira un estado runtime persistido que permita reconstruir item activo, estado de la sesion y ultimo contexto relevante al recargar la pantalla o volver a entrar en una sesion en curso.

Alternativas consideradas:
- Rehidratar la UI combinando multiples endpoints actuales: incrementa coupling y deja huecos temporales entre lecturas.

### 5. Introducir idempotencia minima por operacion de runtime
Operaciones como `start session`, `register silence` y `finalize-item` deben tolerar reintentos razonables sin duplicar silencios ni avanzar dos veces el runtime. La estrategia inicial sera defensiva y basada en estado persistido + validaciones de precondiciones.

Alternativas consideradas:
- Incorporar desde ya claves de idempotencia completas por cliente: valioso, pero puede aplazarse a una fase posterior si la precondicion persistida cubre el riesgo inmediato.

## Risks / Trade-offs

- [Riesgo] La migracion desde runtime en memoria a runtime persistido puede introducir divergencias con sesiones ya existentes. → Mitigacion: limitar el change a sesiones nuevas o definir bootstrap defensivo cuando no exista runtime persistido.
- [Riesgo] La separacion entre runtime persistido e `item_results` puede generar doble escritura sensible a errores. → Mitigacion: encapsular la operacion en servicio transaccional unico.
- [Riesgo] La reanudacion de sesion puede exponer huecos de UX si el frontend asume que todo estado esta en memoria. → Mitigacion: centralizar reconstruccion desde un endpoint runtime de recuperacion.
- [Riesgo] Las validaciones de idempotencia pueden bloquear casos borde legitimos si se modelan demasiado estrictas. → Mitigacion: cubrir transiciones con tests de retry y estados repetidos.

## Migration Plan

1. Añadir modelo persistido de runtime y repositorio backend.
2. Implementar capa de reconstruccion/carga de runtime por sesion.
3. Mover `finalize-item` y eventos de silencio a flujo persistido transaccional.
4. Adaptar frontend para recuperar runtime al entrar o recargar sesion.
5. Añadir tests de reinicio, reanudacion e idempotencia.
6. Desactivar la dependencia operativa del almacenamiento solo en memoria.

Rollback: mantener feature flag o camino de compatibilidad temporal al runtime en memoria mientras se valida la nueva persistencia en entornos de desarrollo y QA.

## Open Questions

- ¿Cuándo conviene migrar el store JSON durable actual a una tabla dedicada o a una estrategia relacional/JSONB formal?
- ¿Necesitamos persistir un historial completo de eventos runtime o basta con el estado consolidado + `item_results`?
- ¿Qué politica exacta de reanudacion debe seguir frontend si encuentra una sesion en `EN_EJECUCION` sin item activo persistido?