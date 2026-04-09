# Modelo de dominio

## Usuario
- id
- nombreCompleto
- email
- rol
- passwordHash

## Paciente
- id
- nombreCompleto
- fechaNacimiento
- sexo
- codigoInterno
- activo
- fechaAlta

## SesionCribado
- id
- pacienteId
- usuarioCreadorId
- estado
- fechaInicio
- fechaFin
- fechaCreacion
- fechaUltimaModificacion

## ResultadoItem
- id
- sesionId
- codigoItem
- etiquetaItem
- estadoItem
- payloadResultado

## Auditoria
- id
- usuarioId
- entidad
- accion
- payload
- fecha