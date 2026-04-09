# Endpoints API

## Auth
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/me

## Patients
- GET /api/patients
- POST /api/patients
- GET /api/patients/:id
- PUT /api/patients/:id
- DELETE /api/patients/:id

## Sessions
- GET /api/sessions
- POST /api/sessions
- GET /api/sessions/:id
- POST /api/sessions/:id/start
- POST /api/sessions/:id/complete

## Results
- GET /api/sessions/:id/results

## Execution
- GET /api/sessions/:id/runtime
- POST /api/sessions/:id/runtime/event
- POST /api/sessions/:id/runtime/finalize-item

## Unith
- POST /api/integrations/unith/token
- POST /api/integrations/unith/events
- POST /api/integrations/unith/asr