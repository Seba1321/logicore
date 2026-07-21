---
name: actualizar-gantt
description: Editar la carta Gantt de un cliente (clientes/<slug>/gantt.json) — agregar tareas, actualizar progreso/estados, fechas, pesos y dependencias. Usar cuando se pida modificar la Gantt, el avance o las tareas de un proyecto.
---

# Actualizar la Gantt de un cliente

Archivo: `clientes/<cliente-slug>/gantt.json`. El portal dibuja la Gantt y calcula el avance desde este archivo (vía Supabase, después del sync).

## Schema

Nivel superior:

```json
{
  "version": 1,
  "periodo": { "fecha_inicio": "2026-06-08", "fecha_fin": "2026-08-14", "zona_horaria": "America/Santiago" },
  "calculo_avance": { "metodo": "promedio_ponderado", "formula": "sum(tarea.progreso*tarea.peso)/sum(tarea.peso)" },
  "tareas": [ ... ]
}
```

Cada tarea:

| Campo | Valores / formato |
|---|---|
| `id_git` | identificador estable (para dependencias y sync) |
| `fase` | agrupador visual: `BPMN`, `Hammer`, `Modelamiento`, `Cierre`, etc. |
| `titulo`, `descripcion` | texto visible en el portal |
| `estado` | `pendiente` \| `en_desarrollo` \| `en_revision` \| `bloqueada` \| `completada` |
| `responsable` | `Methodical` \| `Cliente` \| `Cliente + Methodical` |
| `fecha_inicio`, `fecha_fin` | `YYYY-MM-DD` |
| `progreso` | 0–100 |
| `peso` | importancia relativa (peso 3 impacta 3× más que peso 1) |
| `orden` | orden visual |
| `dependencias` | lista de `id_git` previos |

Avance total = `sum(progreso * peso) / sum(peso)`.

**Ojo:** el portal (`src/pages/Portal.tsx`) muestra el avance **basado en tiempo**: tareas completadas = 100, futuras = 0, en curso proporcional a la fecha, ponderado por `peso`. El campo `progreso` alimenta la tabla/detalle, no reemplaza ese cálculo.

## Checklist antes de commitear

1. JSON válido: `node -e "JSON.parse(require('fs').readFileSync('clientes/<slug>/gantt.json','utf8')); console.log('ok')"`.
2. Fechas de tareas dentro de `periodo.fecha_inicio`–`periodo.fecha_fin`.
3. Cada `dependencias[]` referencia un `id_git` existente.
4. `id_git` únicos; `estado` dentro de los 5 valores válidos.
5. Commit + push a `main` → sync automático (skill `sync-clientes`).

## Fuente de verdad

`clientes/README.md` (sección "Estandar Gantt") y ejemplo real `clientes/maulemed-2026/gantt.json`.
