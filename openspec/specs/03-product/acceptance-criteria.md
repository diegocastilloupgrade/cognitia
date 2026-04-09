# Criterios de aceptación

## AC-01 Login
Dado un usuario válido, cuando introduce credenciales correctas, entonces accede a la zona privada.

## AC-02 Alta de paciente
Dado un clínico autenticado, cuando crea un paciente con los datos obligatorios, entonces el sistema lo registra.

## AC-03 Sesión única abierta
Dado un paciente con sesión en Borrador o En ejecución, cuando se intenta crear otra sesión abierta, entonces el sistema lo impide.

## AC-04 Inicio de sesión
Dada una sesión en Borrador, cuando se lanza la ejecución, entonces la sesión pasa a En ejecución.

## AC-05 Consolidación
Dada una sesión finalizada, cuando el último ítem termina, entonces se guardan los resultados y la sesión pasa a Completada.

## AC-06 Revisión
Dada una sesión completada, cuando el clínico abre el detalle, entonces ve resultados por ítem y sus agregados.