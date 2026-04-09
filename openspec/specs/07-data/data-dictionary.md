# Diccionario de datos

## patients
- id
- full_name
- birth_date
- sex
- internal_code
- active
- created_at
- updated_at

## screening_sessions
- id
- patient_id
- created_by_user_id
- status
- started_at
- finished_at
- created_at
- updated_at

## item_results
- id
- screening_session_id
- item_code
- item_label
- completion_state
- result_payload
- created_at
- updated_at