## ADDED Requirements

### Requirement: Los payloads de resultado por ítem SHALL estar fuertemente tipados por código de ítem
El sistema SHALL definir interfaces TypeScript explícitas para payloads de resultado de los ítems 3.1, 3.2, 3.3, 3.4.1, 3.4.2, 3.5, 3.6 y 3.7.

#### Scenario: El frontend envía payload tipado para el ítem activo
- **WHEN** el frontend prepara una petición finalize-item para un código de ítem específico
- **THEN** el payload SHALL ajustarse en compilación a la interfaz correspondiente de ese ítem

#### Scenario: El backend consume la unión tipada de payloads
- **WHEN** el backend recibe un payload de finalize-item
- **THEN** los handlers runtime del backend SHALL procesarlo mediante tipado discriminado por ítem en lugar de `any`

### Requirement: El esquema de payload tipado SHALL basarse en la definición funcional
El sistema SHALL alinear los campos y tipos de interfaces con las definiciones del documento funcional vigente para cada ítem.

#### Scenario: El mapeo de campos de interfaz es trazable
- **WHEN** un desarrollador revisa las interfaces de payload por ítem
- **THEN** cada interfaz SHALL mapear a campos definidos en la especificación funcional de ese ítem
