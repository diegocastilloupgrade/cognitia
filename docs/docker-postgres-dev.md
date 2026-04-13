## Docker PostgreSQL Dev Guide (COGNITIA)

Esta guia te explica el flujo base para trabajar con PostgreSQL en Docker durante desarrollo.

### 1) Levantar la base de datos

Comando:
`docker compose -f docker-compose.postgres.yml up -d`

Que hace:
- Descarga la imagen si no existe.
- Crea el contenedor `cognitia-postgres`.
- Crea el volumen persistente `cognitia_postgres_data`.
- Ejecuta scripts SQL de `infra/postgres/init` solo cuando el volumen esta vacio.

### 2) Verificar estado y healthcheck

Comando:
`docker compose -f docker-compose.postgres.yml ps`

Esperado:
- El servicio `postgres` debe aparecer como `running` y `healthy`.

### 3) Ver logs de arranque

Comando:
`docker compose -f docker-compose.postgres.yml logs -f postgres`

Uso:
- Ver errores de inicializacion.
- Confirmar que el script `001-init-schema.sql` se ejecuto en un volumen nuevo.

### 4) Parar el contenedor (sin perder datos)

Comando:
`docker compose -f docker-compose.postgres.yml down`

Nota:
- El volumen sigue existiendo, por lo tanto los datos persisten.

### 5) Resetear datos (borrado total del entorno local)

Comando:
`docker compose -f docker-compose.postgres.yml down -v`

Uso:
- Elimina contenedor y volumen.
- En el siguiente `up`, se recrea todo y se re-ejecuta el SQL inicial.

### 6) Inspeccionar el contenedor y conectarte por CLI

Abrir shell de psql:
`docker exec -it cognitia-postgres psql -U cognitia -d cognitia`

Ejemplos utiles dentro de psql:
- Listar tablas: `\dt`
- Ver estructura de una tabla: `\d sessions`
- Salir: `\q`

### 7) Puertos y variables utiles

Por defecto:
- Puerto host: `5433`
- Puerto interno del contenedor: `5432`

Variables opcionales (override):
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

Ejemplo PowerShell con overrides:
`$env:POSTGRES_DB='cognitia_local'; $env:POSTGRES_PORT='5440'; docker compose -f docker-compose.postgres.yml up -d`

### Docker local vs Neon (resumen didactico)

Docker local:
- Ventaja: entorno reproducible, offline, control total y aprendizaje profundo.
- Trade-off: tu equipo opera el contenedor y resuelve setup local.

Neon (gestionado):
- Ventaja: cero operacion de infraestructura, backups y disponibilidad gestionados.
- Trade-off: dependencia de red/servicio cloud y menos control del runtime local.

Regla practica:
- Usa Docker para desarrollo y aprendizaje del stack.
- Usa servicio gestionado cuando priorizas operacion minima en entornos compartidos/produccion.
