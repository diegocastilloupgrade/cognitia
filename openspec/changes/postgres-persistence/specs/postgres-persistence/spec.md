## ADDED Requirements

### Requirement: Persistencia clínica principal en PostgreSQL
El backend MUST persistir pacientes, sesiones, estado runtime y resultados en PostgreSQL como fuente de verdad transaccional.

#### Scenario: Crear y consultar entidades clínicas
- **WHEN** se crean pacientes y sesiones mediante la API existente
- **THEN** el backend MUST almacenar y recuperar esos registros desde PostgreSQL preservando su integridad referencial

#### Scenario: Persistencia consistente de runtime y resultados
- **WHEN** se completa un ítem de ejecución que produce transición runtime y resultado
- **THEN** el backend MUST confirmar ambos cambios en PostgreSQL de forma consistente dentro de una unidad transaccional

### Requirement: Configuración de conexión de base por variables de entorno
El backend MUST resolver conexión PostgreSQL por variables de entorno y fallar de forma explícita cuando la configuración mínima sea inválida.

#### Scenario: Configuración completa válida
- **WHEN** las variables de conexión requeridas están definidas correctamente
- **THEN** el backend MUST establecer conexión y quedar listo para servir peticiones

#### Scenario: Configuración inválida o faltante
- **WHEN** faltan parámetros críticos de conexión o son inválidos
- **THEN** el backend MUST rechazar el arranque con mensaje de error claro
