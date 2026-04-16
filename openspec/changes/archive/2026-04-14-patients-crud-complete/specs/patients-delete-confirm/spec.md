## ADDED Requirements

### Requirement: Confirmación de borrado inline en la tabla
El sistema SHALL implementar la confirmación de borrado directamente en la fila de la tabla, sin usar `window.confirm`. Al pulsar "Eliminar" se muestra "¿Confirmar?" con botones "Sí" y "No" en la misma fila.

#### Scenario: Primer clic muestra confirmación inline
- **WHEN** el clínico pulsa "Eliminar" en una fila
- **THEN** la fila muestra "¿Confirmar?" con los botones "Sí" y "No", y el botón original desaparece

#### Scenario: Confirmar borrado elimina el paciente
- **WHEN** el clínico pulsa "Sí" en la confirmación inline
- **THEN** el sistema llama a `DELETE /patients/:id` y elimina la fila del listado

#### Scenario: Cancelar borrado restaura la fila
- **WHEN** el clínico pulsa "No" en la confirmación inline
- **THEN** la fila vuelve a mostrar el botón "Eliminar" sin realizar ninguna petición HTTP

#### Scenario: Solo una confirmación activa a la vez
- **WHEN** el clínico pulsa "Eliminar" en una fila mientras otra ya muestra confirmación
- **THEN** la confirmación anterior desaparece y la nueva fila muestra la confirmación
