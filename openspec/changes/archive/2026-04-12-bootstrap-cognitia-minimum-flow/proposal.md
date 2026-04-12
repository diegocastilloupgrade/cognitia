# Propuesta: bootstrap-cognitia-minimum-flow

## Objetivo del cambio
Establecer un flujo minimo funcional de COGNITIA de extremo a extremo para validar integracion base entre backend y frontend: autenticacion basica, listado de pacientes, apertura/gestion de sesiones, ejecucion de estimulos demo y registro simple de resultados por sesion.

## Alcance
Este cambio cubre exclusivamente el baseline tecnico-operativo ya implementado:
- Backend con API minima en memoria para `auth`, `patients`, `sessions`, `results` y `execution`.
- Frontend Angular conectado a backend para consumo de pacientes y sesiones.
- Pantalla/flujo de ejecucion conectado a sesiones existentes.
- Visualizacion de estimulos demo desde `frontend/src/assets/stimuli`.
- Registro simple de resultados por estimulo mostrado en endpoint `POST /api/results/session/:id`.
- Endpoints backend de timing basico por item para iniciar, registrar silencios, completar y consultar estado por item/sesion.
- Integracion frontend minima para visualizar y operar estado de timing/silencios durante la ejecucion.
- Pruebas minimas en backend y frontend para validar el flujo de timing/silencios ya conectado.

## Por que se hace ahora
- Permite consolidar una base ejecutable verificable antes de introducir logica clinica compleja.
- Reduce riesgo de integracion al probar temprano contrato API + UI + flujo de ejecucion.
- Habilita iteraciones posteriores (payload tipado, reglas temporales, scoring e integraciones externas) sobre un flujo ya conectado y observable.

## Fuera de alcance explicito
Queda fuera de este cambio:
- Logica clinica real de evaluacion cognitiva.
- Automatizacion completa del timing y de la navegacion entre items sin mediacion manual durante la ejecucion.
- Manejo de silencios y eventos de no respuesta con semantica clinica y respuesta final integrada con avatar real.
- Scoring real, interpretacion clinica y persistencia de resultados derivados.
- Integracion real con Unith (se mantiene simulada/no integrada).
- Cobertura completa de pruebas unitarias, de contrato y de integracion mas alla del baseline ya incorporado.
