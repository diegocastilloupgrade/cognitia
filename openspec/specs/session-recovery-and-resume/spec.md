# Session Recovery And Resume

## ADDED Requirements

### Requirement: El sistema MUST permitir reanudar una sesion clinica en curso
El sistema MUST permitir que frontend recupere y reanude una sesion en `EN_EJECUCION` sin perder el contexto del item activo ni el estado runtime asociado.

#### Scenario: El usuario vuelve a abrir una sesion en curso
- **WHEN** el frontend entra en una sesion que ya estaba en `EN_EJECUCION`
- **THEN** el backend MUST devolver el estado runtime persistido suficiente para reconstruir la ejecucion desde el punto correcto

#### Scenario: La pantalla de ejecucion se recarga durante una sesion
- **WHEN** el navegador recarga la vista de ejecucion de una sesion activa
- **THEN** el frontend MUST reconstruir la UI a partir del runtime persistido sin reiniciar la progresion

### Requirement: La reanudacion MUST manejar sesiones inconsistentes de forma segura
El sistema MUST detectar estados de sesion incompletos o inconsistentes y responder de forma controlada para no duplicar progresion clinica.

#### Scenario: La sesion esta en ejecucion pero no hay item activo persistido
- **WHEN** frontend solicita reanudar una sesion en curso sin item activo valido
- **THEN** el backend MUST devolver un estado recuperable o un error controlado que impida avanzar de forma ambigua