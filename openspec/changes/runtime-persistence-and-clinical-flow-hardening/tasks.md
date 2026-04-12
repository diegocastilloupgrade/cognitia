## 1. Persistencia de runtime y modelo de datos

- [ ] 1.1 Definir el modelo persistido de runtime por sesion (tabla dedicada o columna JSONB) y actualizar contratos/tipos backend asociados.
- [ ] 1.2 Implementar repositorio/servicio de persistencia para cargar y guardar estado runtime durable por `sessionId`.
- [ ] 1.3 Adaptar el arranque de sesion para crear el runtime persistido inicial con el primer item activo.

## 2. Consistencia transaccional de runtime y resultados

- [ ] 2.1 Refactorizar `finalize-item` para persistir de forma consistente resultado de item, item completado y siguiente item activo.
- [ ] 2.2 Persistir eventos de silencio y marcas de completitud dentro del estado runtime durable.
- [ ] 2.3 Añadir validaciones de idempotencia minima para reintentos de `start`, `register silence` y `finalize-item`.

## 3. Recuperacion y reanudacion de sesion

- [ ] 3.1 Exponer un endpoint/backend flow de recuperacion de runtime por sesion apto para reconstruccion de UI.
- [ ] 3.2 Actualizar frontend de ejecucion para rehidratar una sesion en curso desde runtime persistido tras recarga o reentrada.
- [ ] 3.3 Manejar en frontend/backend los casos inconsistentes de sesion en ejecucion sin item activo persistido.

## 4. Migracion, regresion y cierre

- [ ] 4.1 Añadir tests backend para reinicio de proceso, reconstruccion de runtime y consistencia de `finalize-item`.
- [ ] 4.2 Añadir tests frontend para reanudacion de sesion y reconstruccion del item activo tras recarga.
- [ ] 4.3 Ejecutar build/test end-to-end del backend y frontend y corregir regresiones de persistencia o reanudacion.
- [ ] 4.4 Documentar decisiones finales del modelo persistido y dejar el change listo para archivo cuando se complete la implementacion.