## 1. Orquestación de runtime en backend

- [x] 1.1 Refactorizar `backend/src/modules/execution` para centralizar en backend la propiedad de la máquina de estados de runtime (ítem activo, transiciones, finalización). [JIRA: COG-10]
- [x] 1.2 Implementar validación de eventos runtime para aceptar solo eventos del ítem activo. [JIRA: COG-8]
- [x] 1.3 Implementar flujo de finalize-item que devuelva o bien el siguiente ítem activo o bien el estado de finalización de sesión. [JIRA: COG-7]
- [x] 1.4 Añadir/ajustar el contrato de respuesta runtime para incluir metadatos del ítem activo requeridos por el renderizado frontend. [JIRA: COG-9]

## 2. Flujo mock de silencio y feedback del avatar

- [ ] 2.1 Definir un esquema mock de evento de silencio en la frontera execution/integrations compatible con el mapeo futuro de eventos Unith. [JIRA: COG-6]
- [ ] 2.2 Implementar gestión de primer silencio y segundo silencio con actualizaciones de estado runtime. [JIRA: COG-12]
- [ ] 2.3 Devolver payload estructurado de feedback del avatar (código de mensaje + texto) desde backend en eventos de silencio. [JIRA: COG-13]
- [ ] 2.4 Actualizar componente/servicio de ejecución frontend para consumir el payload de feedback por silencio y mostrarlo en UI. [JIRA: COG-15]

## 3. Payloads tipados de resultado por ítem (3.1-3.7)

- [ ] 3.1 Extraer definiciones de campos/tipos por ítem desde `docs/FUN_24DX1198_INTRAS_ASISTENTE_VIRTUAL_V3.docx` y mapearlas a interfaces TypeScript. [JIRA: COG-14]
- [ ] 3.2 Introducir una unión discriminada de payloads de resultado por ítem reemplazando el genérico `data: any` en contratos compartidos/backend/frontend. [JIRA: COG-11]
- [ ] 3.3 Actualizar modelos de petición/respuesta de finalize-item para usar payloads tipados por `itemCode`. [JIRA: COG-19]
- [ ] 3.4 Actualizar guardas de compilación/tests para asegurar que formas de payload no soportadas fallen en compilación. [JIRA: COG-17]

## 4. Cableado frontend de runtime autónomo

- [ ] 4.1 Actualizar el flujo de UI de ejecución para que el clínico solo inicie la sesión una vez y la progresión runtime siga las respuestas backend. [JIRA: COG-20]
- [ ] 4.2 Eliminar o deshabilitar controles manuales de navegación/timing por ítem que entren en conflicto con el comportamiento autónomo de runtime. [JIRA: COG-16]
- [ ] 4.3 Renderizar el estímulo activo estrictamente desde el estado de ítem activo y respuestas de transición que devuelva backend. [JIRA: COG-18]
- [ ] 4.4 Asegurar que las peticiones runtime frontend sigan siendo compatibles con la ruta actual de productor mock de silencio. [JIRA: COG-24]

## 5. Verificación y cobertura de regresión

- [ ] 5.1 Ampliar tests de integración de ejecución backend para progresión autónoma, rechazo de eventos de ítem inválido y comportamiento de escalado por silencios. [JIRA: COG-22]
- [ ] 5.2 Ampliar tests frontend para cubrir transiciones dirigidas por backend y renderizado del feedback de silencio del avatar. [JIRA: COG-21]
- [ ] 5.3 Ejecutar suites de build/test de backend y frontend y corregir regresiones introducidas por la migración de payloads tipados. [JIRA: COG-25]
- [ ] 5.4 Validar que el estado del change en OpenSpec queda apply-ready y documentar cualquier pregunta abierta restante en notas de implementación. [JIRA: COG-23]
