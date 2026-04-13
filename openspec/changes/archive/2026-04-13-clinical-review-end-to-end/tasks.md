## 1. Modelo de lectura de revisión en backend

- [x] 1.1 Validar y, si aplica, extender contrato de `GET /results/session/:sessionId` para soporte explícito de revisión clínica.
- [x] 1.2 Implementar mapeo deterministico de indicadores agregados baseline reutilizable para revisión.
- [x] 1.3 Añadir pruebas de contrato en `backend/src/modules/results` para payload por ítem y agregados de sesión.

## 2. Integración de resultados en frontend

- [x] 2.1 Reemplazar servicio de marcador de posición de `results` por servicio HTTP tipado alineado con API real.
- [x] 2.2 Implementar modelo de vista de revisión (detalle por ítem + agregados) desacoplado del transporte.
- [x] 2.3 Actualizar componente de listado/revisión para renderizar datos reales por sesión completada.

## 3. Estados de interfaz y filtrado

- [x] 3.1 Implementar estados de interfaz `cargando`, `vacío`, `error`, `listo` en la pantalla de revisión.
- [x] 3.2 Añadir filtros mínimos por sesión y contexto clínico básico definidos en la especificación.
- [x] 3.3 Implementar acción de reintento para fallos de consulta de resultados.

## 4. Validación y calidad

- [x] 4.1 Añadir pruebas de frontend para estados de interfaz y render de resultados de revisión.
- [x] 4.2 Ejecutar pruebas backend/frontend y ajustar regresiones del flujo de ejecución existente.
- [x] 4.3 Verificar trazabilidad AC-06 y actualizar evidencias de QA del change.
