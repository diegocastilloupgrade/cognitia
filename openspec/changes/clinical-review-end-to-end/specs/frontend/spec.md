## ADDED Requirements

### Requirement: UI de revisión clínica en módulo Results
El frontend MUST proveer una vista de revisión clínica dedicada para sesiones completadas en el módulo `results`, consumiendo datos reales del backend.

#### Scenario: Navegación a revisión clínica
- **WHEN** el usuario navega a la ruta de resultados
- **THEN** el frontend MUST mostrar una experiencia de revisión basada en datos persistidos y no en placeholders locales

#### Scenario: Render de resultados por sesión
- **WHEN** la vista recibe resultados de una sesión
- **THEN** el frontend MUST mostrar tabla o lista con metadatos de ítem y outcome evaluado

### Requirement: Estados de interfaz para consulta de resultados
El frontend MUST mostrar estados explícitos de carga, vacío y error para la consulta de revisión clínica.

#### Scenario: Estado cargando durante consulta
- **WHEN** la consulta al backend está en progreso
- **THEN** el frontend MUST mostrar un estado de carga visible

#### Scenario: Estado vacío en ausencia de datos
- **WHEN** no existen resultados para la sesión consultada
- **THEN** el frontend MUST mostrar un estado vacío con mensaje claro

#### Scenario: Estado de error recuperable
- **WHEN** la consulta falla por error de red o servidor
- **THEN** el frontend MUST mostrar error y una acción de reintento
