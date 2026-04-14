## ADDED Requirements

### Requirement: Formulario dedicado para alta de paciente
El sistema SHALL proveer una ruta `/patients/new` con un componente `CreatePatientComponent` que permita dar de alta un paciente con los campos: `fullName` (requerido), `birthDate` (requerido), `sex` (opcional), `internalCode` (opcional).

#### Scenario: Alta exitosa navega al listado
- **WHEN** el clínico rellena `fullName` y `birthDate` y envía el formulario
- **THEN** el sistema llama a `POST /patients`, limpia el formulario y navega a `/patients`

#### Scenario: Campo requerido vacío bloquea el envío
- **WHEN** el clínico intenta enviar el formulario sin `fullName` o sin `birthDate`
- **THEN** el botón de envío permanece deshabilitado y no se realiza ninguna petición HTTP

#### Scenario: Error del servidor muestra mensaje
- **WHEN** el servidor responde con error al crear el paciente
- **THEN** el componente muestra un mensaje de error y el formulario permanece con los datos introducidos

#### Scenario: Enlace de cancelar vuelve al listado
- **WHEN** el clínico hace clic en "Cancelar"
- **THEN** el sistema navega a `/patients` sin enviar datos
