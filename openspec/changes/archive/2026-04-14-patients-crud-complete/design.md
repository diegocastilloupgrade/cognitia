## Context

El módulo de pacientes en Angular tiene `ListComponent`, `EditComponent` y `PatientsService`. El `ListComponent` incluye actualmente un formulario de alta embebido que solo cubre `fullName` y `birthDate`. El `EditComponent` tampoco expone `sex`, `internalCode` ni `active`. El backend expone la API REST completa y ya persiste todos los campos. La única tarea es frontal: separar responsabilidades, ampliar formularios y mejorar la UX de borrado.

## Goals / Non-Goals

**Goals:**
- Introducir `CreatePatientComponent` en `/patients/new` con todos los campos del dominio.
- Ampliar `EditComponent` con `sex`, `internalCode` y `active`.
- Reemplazar `window.confirm` con confirmación inline en la tabla.
- Eliminar el formulario de alta embebido del `ListComponent`.
- Añadir tests unitarios para el nuevo componente.

**Non-Goals:**
- Paginación o búsqueda en el listado.
- Validaciones de negocio adicionales más allá de campos requeridos.
- Cambios en el backend.
- Subida de documentos o imágenes de pacientes.

## Decisions

### D1 — Ruta dedicada para alta (`/patients/new`)
Separar el formulario de alta del listado sigue el patrón existente (`edit` ya tiene su propia ruta). Facilita navegación, tests y reutilización. Alternativa descartada: modal/dialog (más complejo, requiere servicio de dialogs no existente).

### D2 — Confirmación inline sin `window.confirm`
Se añade un mini-estado `confirmDeleteId` en el `ListComponent`. Al pulsar "Eliminar" se muestra "¿Confirmar?" + "Sí" / "No" en la misma fila. No requiere dependencias nuevas. Alternativa descartada: dialog service propio (over-engineering para una sola pantalla).

### D3 — Campos opcionales en `CreatePatientDto`
`sex` e `internalCode` se marcan opcionales en el DTO del frontend. El backend ya los acepta como opcionales. El campo `active` se omite en el alta (el backend asigna `true` por defecto).

### D4 — `active` solo en edición
El clínico no debe poder crear un paciente inactivo. `active` solo aparece en `EditComponent` como checkbox.

## Risks / Trade-offs

- [Formulario largo en pantallas pequeñas] → Diseño de columna única con `<label>` wrapped; CSS minimalista existente.
- [Campos `sex` e `internalCode` sin lista controlada en el backend] → Se usa `<input type="text">` para `sex`; se puede refinar a `<select>` cuando el dominio lo defina.

## Migration Plan

No hay migración de datos. El cambio es puramente frontal. El despliegue es un `ng build` normal. Rollback: revertir el commit.

## Open Questions

- ¿`sex` debe ser un enum (`M` / `F` / `Otro`) o texto libre? Por ahora texto libre; se puede restringir cuando el equipo clínico defina los valores aceptados.
