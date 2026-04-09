# Visión de solución

La solución se compone de una SPA Angular para usuarios clínicos y ejecución controlada del test, un backend Node.js que expone API REST y orquesta la lógica de negocio, una base de datos PostgreSQL para persistencia estructurada y una integración externa con Unith para avatar, TTS y ASR.

El backend es el orquestador funcional: decide qué ítem está activo, qué estímulo debe mostrarse, cuándo se aplica una ayuda, cuándo finaliza un ítem y cómo se consolidan los resultados.