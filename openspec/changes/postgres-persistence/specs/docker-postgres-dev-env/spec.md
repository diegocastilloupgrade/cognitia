## ADDED Requirements

### Requirement: Entorno local PostgreSQL reproducible con Docker Compose
El sistema MUST proveer un entorno local de PostgreSQL ejecutable con Docker Compose, incluyendo configuración de red, volumen persistente y healthcheck.

#### Scenario: Levantar base local con un comando
- **WHEN** el desarrollador ejecuta docker compose up para el servicio de base de datos
- **THEN** PostgreSQL MUST iniciar en estado healthy y aceptar conexiones desde el backend local

#### Scenario: Reiniciar contenedor sin perder datos del entorno local
- **WHEN** el contenedor se reinicia sin eliminar el volumen asociado
- **THEN** los datos previamente insertados MUST permanecer disponibles

### Requirement: Inicialización automática de esquema en entorno nuevo
El sistema MUST ejecutar scripts SQL de inicialización cuando el volumen de PostgreSQL esté vacío.

#### Scenario: Primer arranque en máquina nueva
- **WHEN** el volumen de datos no contiene catálogo previo
- **THEN** el contenedor MUST crear el esquema base requerido por pacientes, sesiones, runtime y resultados

#### Scenario: Arranque posterior con volumen ya inicializado
- **WHEN** el volumen ya contiene esquema y datos
- **THEN** el sistema MUST no destruir ni recrear tablas existentes de forma no idempotente
