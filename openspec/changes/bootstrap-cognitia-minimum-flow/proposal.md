# Proposal: bootstrap-cognitia-minimum-flow

## Objetivo del cambio
Establecer un flujo minimo funcional de COGNITIA de extremo a extremo para validar integracion base entre backend y frontend: autenticacion basica, listado de pacientes, apertura/gestion de sesiones, ejecucion de estimulos demo y registro simple de resultados por sesion.

## Alcance
Este cambio cubre exclusivamente el baseline tecnico-operativo ya implementado:
- Backend con API minima en memoria para `auth`, `patients`, `sessions`, `results` y `execution`.
- Frontend Angular conectado a backend para consumo de pacientes y sesiones.
- Pantalla/flujo de ejecucion conectado a sesiones existentes.
- Visualizacion de estimulos demo desde `frontend/src/assets/stimuli`.
- Registro simple de resultados por estimulo mostrado en endpoint `POST /api/results/session/:id`.

## Por que se hace ahora
- Permite consolidar una base ejecutable verificable antes de introducir logica clinica compleja.
- Reduce riesgo de integracion al probar temprano contrato API + UI + flujo de ejecucion.
- Habilita iteraciones posteriores (payload tipado, reglas temporales, scoring e integraciones externas) sobre un flujo ya conectado y observable.

## Fuera de alcance explicito
Queda fuera de este cambio:
- Logica clinica real de evaluacion cognitiva.
- Reglas de timing avanzadas por item o sesion.
- Manejo de silencios y eventos de no respuesta con semantica clinica.
- Scoring real, interpretacion clinica y persistencia de resultados derivados.
- Integracion real con Unith (se mantiene simulada/no integrada).
- Cobertura formal de pruebas unitarias y de contrato mas alla de validacion manual minima del flujo.
