## 1. Setup Docker y configuración base

- [x] 1.1 Crear archivo docker-compose para PostgreSQL con volumen persistente, healthcheck y puertos de desarrollo.
- [x] 1.2 Añadir script SQL de inicialización de esquema para patients, sessions, runtime y results.
- [x] 1.3 Documentar comandos Docker esenciales para dev: levantar, parar, ver logs, resetear volumen e inspeccionar contenedor.

## 2. Configuración backend para PostgreSQL

- [x] 2.1 Añadir dependencias de cliente PostgreSQL al backend y actualizar package-lock.
- [x] 2.2 Extender configuración de entorno con variables DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD y DB_SSL.
- [x] 2.3 Implementar módulo de conexión a base con validación de configuración y fail-fast en arranque.

## 3. Migración de persistencia por módulos

- [x] 3.1 Implementar repositorio SQL para pacientes manteniendo el contrato actual del módulo.
- [x] 3.2 Implementar repositorio SQL para sesiones (creación, inicio, cambio de estado y consulta).
- [x] 3.3 Implementar repositorio SQL para runtime/timing y eventos de silencio.
- [x] 3.4 Implementar repositorio SQL para resultados tipados por ítem.
- [x] 3.5 Reemplazar wiring de store JSON por repositorios PostgreSQL en servicios backend.

## 4. Consistencia, transacciones y compatibilidad

- [x] 4.1 Asegurar transacción SQL en finalize-item para persistir transición runtime y resultado de forma atómica.
- [x] 4.2 Ajustar consultas para recuperar sesiones en curso y estado runtime tras reinicio.
- [x] 4.3 Validar que endpoints y payloads externos no cambian respecto al contrato vigente.

## 5. Validación y aprendizaje guiado

- [x] 5.1 Añadir/actualizar pruebas backend para ejecutar contra PostgreSQL en contenedor.
- [x] 5.2 Ejecutar npm test backend con base en Docker y registrar evidencia de resultados.
- [x] 5.3 Crear guía didáctica breve Docker vs servicio gestionado (Neon): ventajas, trade-offs y cuándo usar cada uno.
- [x] 5.4 Verificar trazabilidad de requisitos modificados y documentar evidencia QA del change.
