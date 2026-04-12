# Backend

## ADDED Requirements

### Requirement: REQ-BACKEND-MIN-FLOW-1: API minima en memoria para COGNITIA
El sistema MUST exponer una API REST minima en memoria para soportar pacientes, sesiones y resultados del flujo bootstrap de COGNITIA.

#### Scenario: API en memoria para pacientes, sesiones, resultados
- Backend expone una API REST en /api.
- La API incluye recursos:
  - /patients para CRUD basico de pacientes en memoria.
  - /sessions para gestionar sesiones de cribado (BORRADOR, EN_EJECUCION, COMPLETADA) en memoria.
  - /results/session/:sessionId para guardar y consultar resultados por item en memoria.
- La API esta implementada en Node + TypeScript + Express.

### Requirement: REQ-BACKEND-EXECUTION-TIMING-1: Endpoints baseline de timing y silencio por item
El sistema MUST exponer endpoints en memoria para iniciar timing por item, registrar silencios manuales, completar un timing y consultar estado por item o por sesion dentro del flujo bootstrap.

#### Scenario: Iniciar timing de item
- **WHEN** el cliente llama al endpoint de inicio de timing para un item valido de una sesion valida
- **THEN** la API crea o sustituye el estado de timing del item con `startedAt`, `durationSeconds`, `silenceThresholdSeconds`, `silenceEvents` vacio y `completed` en `false`

#### Scenario: Registrar primer y segundo silencio
- **WHEN** el cliente envia un evento de silencio con nivel 1 o 2 sobre un estado de timing activo
- **THEN** la API agrega un evento `FIRST_SILENCE` o `SECOND_SILENCE` al estado de timing del item

#### Scenario: Completar y consultar estado de timing
- **WHEN** el cliente completa el timing de un item o consulta el estado del item o de la sesion
- **THEN** la API devuelve el estado actualizado del item o la lista de estados existentes para la sesion

## ADDED Constraints
- La persistencia de estados de timing en este cambio se mantiene en memoria.
- Los endpoints de timing no calculan scoring clinico ni deciden automaticamente el siguiente item.
