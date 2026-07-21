---
name: agregar-hallazgos
description: Publicar hallazgos del análisis HAMMER de un cliente — imágenes en hammer/ declaradas en hallazgos.json, asociadas a un proceso por proceso_slug. Usar cuando se pida agregar hallazgos, resultados HAMMER o evidencia de análisis de procesos.
---

# Agregar hallazgos HAMMER

Los hallazgos son el output del análisis HAMMER y se publican como **imágenes** (capturas del análisis). Van en `clientes/<cliente-slug>/hammer/` y se declaran en `hallazgos.json`.

## Schema

```json
{
  "hallazgos": [
    {
      "proceso_slug": "ciclo-vida-personal",
      "titulo": "Reproceso en aprobación de asistencia",
      "archivo_path": "hammer/ciclo-vida-personal-1.png",
      "archivo_url": null,
      "orden": 1
    }
  ]
}
```

## Reglas

- Imágenes `.png`, `.jpg` o `.webp`; `archivo_path` relativo a la carpeta del cliente; `archivo_url` siempre `null` en Git.
- `proceso_slug` debe existir en `procesos.json` del mismo cliente (así se asocia en Supabase).
- `titulo` se muestra como pie de foto; el portal muestra cada hallazgo como imagen clickeable.
- El **primer hallazgo** de un proceso lo sube de etapa: "Construyendo BPMN" → "Análisis HAMMER".
- Después de editar: commit + push a `main` → sync automático (skill `sync-clientes`); el sync sube las imágenes a Storage y escribe `proceso_hallazgos`.

## Metodología HAMMER (para redactar hallazgos)

Enfoque de reingeniería de Michael Hammer: cuestionar supuestos del proceso actual, identificar actividades sin valor, detectar quiebres/reprocesos/esperas, revisar handoffs entre áreas, proponer simplificación o rediseño. Los hallazgos alimentan el informe final.

## Fuente de verdad

`clientes/README.md` (secciones "Hallazgos HAMMER" y "Metodología Hammer").
