# Máquina de estados de sesión

- BORRADOR -> EN_EJECUCION
- EN_EJECUCION -> COMPLETADA

## Restricciones
- No existe retorno desde COMPLETADA.
- Una sesión interrumpida no vuelve a BORRADOR; se descarta funcionalmente y se crea otra.