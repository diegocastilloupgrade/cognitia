## ADDED Requirements

### Requirement: Formulario de edición con todos los campos del dominio
El sistema SHALL mostrar los campos `fullName`, `birthDate`, `sex`, `internalCode` y `active` en `PatientEditComponent`. Los campos `fullName` y `birthDate` son requeridos; el resto son opcionales.

#### Scenario: Carga del paciente rellena todos los campos
- **WHEN** el clínico navega a `/patients/:id/edit`
- **THEN** el formulario muestra los valores actuales de `fullName`, `birthDate`, `sex`, `internalCode` y el estado de `active`

#### Scenario: Guardar cambios con campos completos
- **WHEN** el clínico modifica cualquier campo y pulsa "Guardar cambios"
- **THEN** el sistema llama a `PATCH /patients/:id` con los valores actualizados y muestra mensaje de éxito

#### Scenario: Toggle de activo refleja el estado en el servidor
- **WHEN** el clínico desmarca el checkbox `active` y guarda
- **THEN** el sistema envía `active: false` en el cuerpo de la petición

#### Scenario: Campos opcionales vacíos se envían como cadenas vacías o se omiten
- **WHEN** el clínico deja `sex` e `internalCode` vacíos y guarda
- **THEN** el sistema envía la petición sin error y el servidor acepta el payload
