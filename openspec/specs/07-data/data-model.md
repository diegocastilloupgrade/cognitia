# Modelo de datos

## Tablas
- users
- patients
- screening_sessions
- item_results
- audit_logs

## Estrategia
Persistir agregados por ítem en JSONB para flexibilidad del prototipo, manteniendo tablas nucleares normalizadas para pacientes, sesiones y auditoría.