## ADDED Requirements

### Requirement: Revisión clínica de sesión completada
El sistema MUST permitir que un clínico consulte una sesión completada y visualice resultados por ítem junto con indicadores agregados baseline derivados de los datos persistidos.

#### Scenario: Abrir revisión de sesión completada
- **WHEN** el clínico selecciona una sesión en estado completada
- **THEN** el frontend MUST recuperar los resultados persistidos de esa sesión y mostrarlos en una vista de revisión dedicada

#### Scenario: Visualizar detalle por ítem y agregados baseline
- **WHEN** la vista de revisión recibe resultados válidos
- **THEN** el sistema MUST mostrar metadatos por ítem (`itemCode`, `positionInSession`, `evaluatedOutcome`) y al menos un resumen agregado de la sesión

### Requirement: Consulta filtrable para revisión
El sistema MUST permitir filtrar la revisión por identificadores de sesión y contexto clínico básico para facilitar la localización de resultados.

#### Scenario: Filtrar por sesión
- **WHEN** el clínico proporciona un `sessionId` válido
- **THEN** el sistema MUST devolver y mostrar únicamente los resultados asociados a esa sesión

#### Scenario: Sesión sin resultados disponibles
- **WHEN** la consulta de revisión no devuelve resultados
- **THEN** el frontend MUST mostrar un estado vacío explícito sin errores técnicos

### Requirement: Estados de interfaz confiables en revisión
El frontend MUST implementar estados explícitos de carga, error y vacío para la experiencia de revisión clínica.

#### Scenario: Carga de datos de revisión
- **WHEN** se inicia una consulta de resultados para revisión
- **THEN** el frontend MUST presentar un estado de carga hasta recibir respuesta o error

#### Scenario: Error de consulta en revisión
- **WHEN** la API de resultados responde con error
- **THEN** el frontend MUST mostrar un estado de error recuperable y permitir reintentar la consulta
