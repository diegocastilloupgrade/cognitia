# Backend minimum flow

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