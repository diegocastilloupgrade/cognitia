## Why

Actualmente el backend persiste en archivo JSON local y parte del contrato histórico aún habla de memoria, lo que limita concurrencia, integridad y portabilidad entre entornos. Este cambio se hace ahora para dar el siguiente salto del roadmap: pasar a una base de datos real levantada en Docker sin depender todavía de un servicio externo gestionado.

## What Changes

- Migrar la persistencia de pacientes, sesiones, runtime y resultados a PostgreSQL.
- Incorporar un entorno local de base de datos con Docker Compose para desarrollo y pruebas.
- Añadir inicialización de esquema SQL y configuración de conexión por variables de entorno.
- Adaptar repositorios/servicios backend para leer y escribir en Postgres manteniendo el contrato API existente.
- Mantener autenticación y flujo clínico actuales sin cambios de rutas externas.
- Definir estrategia de transición controlada desde almacenamiento JSON a Postgres para desarrollo local.

## Capabilities

### New Capabilities
- `docker-postgres-dev-env`: Entorno Docker Compose para levantar PostgreSQL local con configuración reproducible, healthcheck y script de inicialización.
- `postgres-persistence`: Persistencia relacional en PostgreSQL para entidades clínicas y runtime, incluyendo configuración de conexión y creación de esquema.

### Modified Capabilities
- `backend`: Cambia el requisito de API en memoria a API respaldada por persistencia PostgreSQL sin romper el contrato REST existente.
- `runtime-persistence`: Mantiene el requisito de durabilidad, pero ahora exige almacenamiento en PostgreSQL y recuperación desde tablas runtime.
- `execution-minimum-flow`: Se elimina la restricción de no usar base relacional para que el flujo mínimo opere sobre Postgres.
- `result-payload-baseline`: Se mantiene el contrato tipado de resultados, pero su persistencia consistente pasa a ejecutarse sobre transacciones SQL.

## Impact

- Backend: capa de persistencia y servicios de módulos patients, sessions, execution y results.
- Infra local: nuevo archivo docker-compose, volumen de datos y scripts SQL de bootstrap.
- Configuración: nuevas variables de entorno para conexión Postgres (host, puerto, db, usuario, password, ssl).
- Dependencias: driver de PostgreSQL y utilidades de migración/ejecución de SQL en backend.
- QA: pruebas de integración con base real en contenedor para validar continuidad del contrato API.
