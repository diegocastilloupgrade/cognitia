# Typed Item Result Payloads

## ADDED Requirements

### Requirement: Los payloads de resultado por item SHALL estar fuertemente tipados por codigo de item
El sistema SHALL definir interfaces TypeScript explicitas para payloads de resultado de los items 3.1, 3.2, 3.3, 3.4.1, 3.4.2, 3.5, 3.6 y 3.7.

#### Scenario: El frontend envia payload tipado para el item activo
- WHEN el frontend prepara una peticion finalize-item para un codigo de item especifico
- THEN el payload SHALL ajustarse en compilacion a la interfaz correspondiente de ese item

#### Scenario: El backend consume la union tipada de payloads
- WHEN el backend recibe un payload de finalize-item
- THEN los handlers runtime del backend SHALL procesarlo mediante tipado discriminado por item en lugar de `any`

### Requirement: El esquema de payload tipado SHALL basarse en la definicion funcional
El sistema SHALL alinear los campos y tipos de interfaces con las definiciones del documento funcional vigente para cada item.

#### Scenario: El mapeo de campos de interfaz es trazable
- WHEN un desarrollador revisa las interfaces de payload por item
- THEN cada interfaz SHALL mapear a campos definidos en la especificacion funcional de ese item