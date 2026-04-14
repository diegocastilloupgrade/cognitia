## 1. Servicio frontend

- [x] 1.1 Ampliar `CreatePatientDto` en `patients.service.ts` con campos opcionales `sex` e `internalCode`
- [x] 1.2 Ampliar `UpdatePatientDto` en `patients.service.ts` con campos opcionales `sex`, `internalCode` y `active`

## 2. Componente de alta (`CreatePatientComponent`)

- [x] 2.1 Crear `create.component.ts` con lógica de formulario, llamada a `createPatient()` y navegación a `/patients` tras éxito
- [x] 2.2 Crear `create.component.html` con campos `fullName`, `birthDate`, `sex`, `internalCode`, botón de envío deshabilitado si no válido y botón Cancelar
- [x] 2.3 Crear `create.component.css` (estilos básicos consistentes con el resto del módulo)
- [x] 2.4 Declarar `CreatePatientComponent` en `patients.module.ts`
- [x] 2.5 Añadir ruta `new → CreatePatientComponent` en `patients-routing.module.ts`

## 3. Listado — refactorización

- [x] 3.1 Eliminar el formulario de alta embebido del `list.component.html`
- [x] 3.2 Eliminar la lógica de alta y el campo `form` del `list.component.ts`
- [x] 3.3 Añadir botón "Nuevo paciente" con `[routerLink]="['/patients/new']"` en el listado
- [x] 3.4 Reemplazar `window.confirm` y `deletingPatientId` por `confirmDeleteId` con lógica de confirmación inline en `list.component.ts`
- [x] 3.5 Actualizar `list.component.html` para mostrar confirmación inline (¿Confirmar? / Sí / No) cuando `confirmDeleteId === patient.id`

## 4. Formulario de edición — campos completos

- [x] 4.1 Ampliar `edit.component.ts` para incluir `sex`, `internalCode` y `active` en `form`
- [x] 4.2 Actualizar `edit.component.html` con campos `sex`, `internalCode` y checkbox `active`

## 5. Tests unitarios

- [x] 5.1 Crear `create.component.spec.ts`: alta exitosa navega a `/patients`; campo requerido vacío bloquea envío; error del servidor muestra mensaje
- [x] 5.2 Actualizar `list.component.spec.ts`: primer clic muestra confirmación inline; "No" restaura la fila; "Sí" llama a `deletePatient`
- [x] 5.3 Actualizar `edit.component.spec.ts`: carga rellena `sex`, `internalCode` y `active`; guardar con `active: false` envía el valor correcto

## 6. Entrega

- [x] 6.1 Ejecutar tests del frontend (`npm test`) y verificar que todos pasan
- [x] 6.2 Commit y PR `feature/patients-crud-complete`
