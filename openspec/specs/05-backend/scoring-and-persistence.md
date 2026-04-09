# Scoring y persistencia

El prototipo no emite diagnóstico, pero sí calcula y persiste resultados agregados por ítem. Cada resultado se guarda en `item_results.result_payload` como JSONB, preservando el detalle mínimo necesario para la revisión clínica posterior.