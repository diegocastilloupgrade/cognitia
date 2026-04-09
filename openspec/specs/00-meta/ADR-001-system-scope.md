# ADR-001 - Alcance del sistema prototipo

## Estado
Aceptado.

## Contexto
El proyecto necesita un prototipo validable que digitalice el test COGNITIA con un avatar, sin sustituir el criterio clínico profesional.

## Decisión
Construir una única plataforma web con dos áreas funcionales: backoffice autenticado para clínicos y ejecución pública controlada para pacientes, con backend propio que orquesta la lógica del test y la integración con Unith.

## Consecuencias
- Se simplifica operación y despliegue.
- La lógica crítica no queda delegada en prompts opacos.
- El prototipo prioriza trazabilidad y validación funcional frente a optimización avanzada.