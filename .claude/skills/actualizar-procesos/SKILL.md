---
name: actualizar-procesos
description: Editar procesos.json de un cliente — agregar procesos, ligar diagramas BPMN o informes PDF finales, y entender el embudo de etapas del portal. Usar cuando se pida agregar/modificar un proceso, subir un BPMN o publicar un informe final.
---

# Actualizar procesos de un cliente

Archivo: `clientes/<cliente-slug>/procesos.json`. Los archivos van en `bpmn/` (`.bpmn`) e `informes/` (`.pdf`) dentro de la carpeta del cliente.

## Schema de un proceso

```json
{
  "slug": "ciclo-vida-personal",
  "nombre": "Ciclo de Vida del Personal",
  "area": "Recursos Humanos",
  "estado": "modelado",
  "responsable_methodical": "Nombre",
  "responsable_cliente": "Nombre",
  "descripcion": "…",
  "orden": 1,
  "bpmn": [
    { "nombre": "…", "descripcion": "…", "archivo_path": "bpmn/Ciclo-de-Vida-del-Personal.bpmn", "archivo_url": null, "preview_path": "bpmn/Ciclo-de-Vida-del-Personal-preview.svg", "preview_url": null }
  ],
  "informes": [
    { "nombre": "Informe final", "descripcion": "…", "archivo_path": "informes/ciclo-vida-personal.pdf", "archivo_url": null }
  ]
}
```

## Embudo de etapas (derivado, NO se escribe a mano)

```
¿tiene informe?      → "Informe final"
¿tiene ≥1 hallazgo?  → "Análisis HAMMER"     (hallazgos van en hallazgos.json, skill agregar-hallazgos)
¿tiene BPMN?         → "Construyendo BPMN"
si no                → "Por levantar"
```

El campo `estado` de `procesos.json` **ya no afecta** al portal. El embudo se fija en el vínculo proceso↔archivo en Supabase, no en que exista un archivo suelto: un `.bpmn` en la carpeta sin entrada en el array `bpmn` no cambia la etapa.

## Agregar un BPMN

1. Guardar el archivo en `bpmn/<Nombre-Del-Proceso>.bpmn` (ASCII, kebab-case o Pascal-Con-Guiones; nunca subir visualizadores HTML — el portal ya tiene visor bpmn-js).
2. Generar su miniatura con `python3 audit_bpmn.py <archivo.bpmn> --svg-dir <destino>` y dejarla como `bpmn/<Nombre>-preview.svg`. Es opcional: sin ella el portal muestra una tarjeta de texto en vez del diagrama en chico.
3. Agregar la entrada al array `bpmn` del proceso (no dejarlo `[]`), con `archivo_url` y `preview_url` en `null`.
4. Commit + push a `main` → el sync sube ambos archivos al bucket `bpmn` de Storage y genera las URL públicas.

## Agregar un informe final

Igual, pero `.pdf` en `informes/` y entrada en el array `informes`. Subirlo lleva el proceso a "Informe final".

## Reglas

- `archivo_path` siempre relativo a la carpeta del cliente; `archivo_url` siempre `null` en Git.
- `slug` del proceso debe ser único dentro del cliente (los hallazgos se asocian por `proceso_slug`).
- Validar JSON antes de commitear y sincronizar (skill `sync-clientes`).

## Fuente de verdad

`clientes/README.md` (secciones "Estandar BPMN", "Etapa Del Proceso", "Informe Final Por Proceso") y `clientes/maulemed-2026/procesos.json`.
