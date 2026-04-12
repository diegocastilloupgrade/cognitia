## 1. Backend Review Read Model

- [ ] 1.1 Validar y, si aplica, extender contrato de `GET /results/session/:sessionId` para soporte explícito de revisión clínica.
- [ ] 1.2 Implementar mapeo deterministico de indicadores agregados baseline reutilizable para revisión.
- [ ] 1.3 Añadir pruebas de contrato en `backend/src/modules/results` para payload por ítem y agregados de sesión.

## 2. Frontend Results Integration

- [ ] 2.1 Reemplazar servicio placeholder de `results` por servicio HTTP tipado alineado con API real.
- [ ] 2.2 Implementar view model de revisión (detalle por ítem + agregados) desacoplado del transporte.
- [ ] 2.3 Actualizar componente de listado/revisión para renderizar datos reales por sesión completada.

## 3. UI States and Filtering

- [ ] 3.1 Implementar estados de interfaz `loading`, `empty`, `error`, `ready` en la pantalla de revisión.
- [ ] 3.2 Añadir filtros mínimos por sesión y contexto clínico básico definidos en el spec.
- [ ] 3.3 Implementar acción de reintento para fallos de consulta de resultados.

## 4. Validation and Quality

- [ ] 4.1 Añadir pruebas de frontend para estados de UI y render de resultados de revisión.
- [ ] 4.2 Ejecutar pruebas backend/frontend y ajustar regresiones del flujo de ejecución existente.
- [ ] 4.3 Verificar trazabilidad AC-06 y actualizar evidencias de QA del change.
