## Why

El módulo de pacientes tiene el esqueleto funcional (list, edit, delete) pero la UX está incompleta: el formulario de alta está embebido en la lista, los formularios solo cubren `fullName` y `birthDate` omitiendo `sex`, `internalCode` y `active`, y la confirmación de borrado depende de `window.confirm`. Completar el CRUD desbloquea el journey clínico completo y permite avanzar al ciclo de vida de sesiones.

## What Changes

- Separar el formulario de alta en una ruta dedicada `/patients/new` con su propio componente.
- Añadir los campos `sex`, `internalCode` al formulario de crear y al de editar.
- Añadir el toggle `active` al formulario de editar.
- Reemplazar `window.confirm` en la eliminación por confirmación inline en la fila de la tabla.
- Eliminar el formulario de alta embebido del `ListComponent`.
- Añadir un botón "Nuevo paciente" en la vista de lista que navega a `/patients/new`.
- Cubrir los nuevos componentes con tests unitarios.

## Capabilities

### New Capabilities

- `patients-create-form`: Formulario dedicado en `/patients/new` para dar de alta un paciente con todos los campos del dominio (fullName, birthDate, sex, internalCode).
- `patients-edit-form-complete`: Formulario de edición ampliado con campos `sex`, `internalCode` y toggle `active`.
- `patients-delete-confirm`: Confirmación de borrado inline en la fila de la tabla (sin `window.confirm`).

### Modified Capabilities

<!-- No hay specs de pacientes previos que cambien requisitos. -->

## Impact

- `frontend/src/app/features/patients/components/`: nuevos `create.component.*`, modificaciones en `list.component.*` y `edit.component.*`.
- `frontend/src/app/features/patients/patients-routing.module.ts`: nueva ruta `new → CreatePatientComponent`.
- `frontend/src/app/features/patients/patients.module.ts`: declarar `CreatePatientComponent`.
- `frontend/src/app/features/patients/services/patients.service.ts`: ampliar `CreatePatientDto` con campos opcionales.
- No hay cambios en el backend (la API ya soporta todos los campos).
