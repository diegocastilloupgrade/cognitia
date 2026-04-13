## Context

COGNITIA ya cubre un flujo funcional completo de autenticación, ejecución y revisión clínica, pero la persistencia actual usa archivo JSON local y especificaciones históricas aún referencian memoria. Para producción o incluso para desarrollo colaborativo, esto genera límites de concurrencia, bloqueo de I/O, dificultad de inspección y ausencia de garantías transaccionales.

El objetivo del bloque es migrar a PostgreSQL levantado en local mediante Docker Compose, manteniendo las APIs actuales para no romper frontend ni contratos ya validados.

Stakeholders principales:
- Equipo backend: migración de repositorios y manejo de transacciones.
- Equipo frontend: continuidad sin cambios contractuales en endpoints.
- QA/Producto: mantener criterios AC existentes durante la migración.
- Devs en formación Docker: entender ciclo completo container -> DB -> app.

Restricciones:
- Se prioriza entorno local reproducible sin depender de servicios externos gestionados.
- El cambio no incluye aún dockerización completa de toda la app (solo base de datos en este bloque).

## Goals / Non-Goals

**Goals:**
- Proveer base PostgreSQL en Docker Compose lista para desarrollo local.
- Migrar persistencia backend de JSON a PostgreSQL en módulos críticos (patients, sessions, runtime, results).
- Mantener contratos HTTP existentes para no romper frontend.
- Definir esquema SQL inicial y estrategia de inicialización idempotente.
- Dejar trazabilidad didáctica para entender cómo Docker facilita entorno de BBDD local.

**Non-Goals:**
- Dockerizar frontend/backend en este bloque.
- Implementar escalado horizontal o clustering de PostgreSQL.
- Resolver seguridad avanzada de secretos para producción (Vault/KMS).
- Introducir ORM pesado si una capa SQL directa cubre el alcance del bloque.

## Decisions

### D-1: PostgreSQL en Docker Compose como entorno canónico local

**Decisión:** usar un archivo docker-compose dedicado para base de datos (`postgres` + volumen persistente + healthcheck).

**Alternativas consideradas:**
- Servicio gestionado externo (Neon): útil, pero depende de red/cuentas y no enseña ciclo local completo.
- PostgreSQL instalado en host: menos reproducible entre máquinas y más fricción de setup.

**Rationale didáctico:** Docker encapsula versión exacta del motor, configuración y red, de forma que cualquier dev ejecuta el mismo entorno con un solo comando.

### D-2: Inicialización por scripts SQL versionados simples

**Decisión:** crear script SQL inicial para esquema base (tablas, índices, constraints) ejecutado al iniciar el contenedor si el volumen está vacío.

**Alternativas consideradas:**
- Migraciones con ORM desde el día 1: mayor complejidad para este bloque inicial.
- Crear tablas manualmente en cada máquina: no reproducible.

**Rationale:** prioriza claridad de aprendizaje y control explícito del modelo relacional.

### D-3: Capa de persistencia backend desacoplada del transporte HTTP

**Decisión:** mantener controladores/contratos API y reemplazar internamente adaptadores de store JSON por repositorios SQL.

**Alternativas consideradas:**
- Reescribir módulos completos: alto riesgo de regresión.
- Mezclar SQL directo dentro de controladores: acoplamiento y mantenibilidad baja.

**Rationale:** minimiza impacto funcional y permite pruebas de regresión por contrato.

### D-4: Conexión por variables de entorno con defaults de desarrollo

**Decisión:** introducir variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`) y un único punto de carga de config.

**Alternativas consideradas:**
- Config hardcodeada: no portable.
- Archivo local no versionado como única fuente: difícil automatización CI.

**Rationale:** prepara camino para futuros entornos (Docker local, VPS, cloud) sin cambiar código.

### D-5: Estrategia de transición incremental con fallback solo en desarrollo

**Decisión:** migrar primero lectura/escritura principal a Postgres y mantener fallback controlado a JSON únicamente para facilitar debugging temporal local durante la transición.

**Alternativas consideradas:**
- Big bang sin fallback: más simple pero más riesgoso.
- Doble escritura prolongada: más compleja para este bloque.

**Rationale:** balancea seguridad de migración y simplicidad.

## Risks / Trade-offs

- [Risk] Desalineación entre esquema SQL y contratos actuales -> Mitigation: tests de contrato backend corriendo contra Postgres en CI local.
- [Risk] Fricción inicial con Docker (puertos, volúmenes, permisos) -> Mitigation: guía paso a paso con comandos y troubleshooting.
- [Risk] Degradación de rendimiento por consultas no indexadas -> Mitigation: índices básicos por claves de sesión/item y revisión con EXPLAIN en iteraciones posteriores.
- [Trade-off] SQL explícito sin ORM reduce magia pero aumenta trabajo manual -> Mitigation: repositorios pequeños y tipados, más migraciones versionadas en bloque siguiente.

## Migration Plan

1. Agregar docker-compose de Postgres + volumen + healthcheck.
2. Definir esquema SQL inicial e inicialización automática del contenedor.
3. Incorporar cliente PostgreSQL en backend y extender config/env.
4. Implementar repositorios SQL para patients, sessions, runtime y results.
5. Reemplazar wiring de persistencia JSON por SQL en servicios.
6. Ejecutar suite de contrato backend sobre Postgres y ajustar consultas.
7. Documentar flujo didáctico Docker (levantar, verificar, resetear volumen, inspeccionar datos).

Rollback:
- Si falla la migración, volver a commit previo del bloque y reactivar persistencia JSON.
- Como no hay corte de API externa en este bloque, rollback es de implementación interna.

## Open Questions

- ¿Mantendremos fallback JSON en runtime temporal o lo eliminamos dentro de este mismo bloque?
- ¿Adoptamos migraciones con herramienta dedicada (por ejemplo drizzle/knex) en este bloque o en el siguiente?
- ¿Definimos política inicial de backups para entorno VPS en el bloque de dockerización completa?
