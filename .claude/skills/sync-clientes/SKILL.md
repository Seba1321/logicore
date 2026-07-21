---
name: sync-clientes
description: Sincronizar los datos de clientes/ hacia Supabase (local o vía GitHub Action) para que el portal refleje los cambios. Usar cuando se pida sincronizar, subir datos al portal, o cuando un cambio en clientes/ no aparece en /portal.
---

# Sincronización clientes/ → Supabase

El portal **no** lee los JSON de Git: lee Supabase. Cualquier cambio en `clientes/` se ve en el portal **solo después del sync**.

## Opción 1 — Automático (lo normal)

Push a `main` tocando `clientes/**`, `scripts/sync-clientes-supabase.mjs` o `supabase-empresas-login.sql` dispara la GitHub Action **`Sync Clientes To Supabase`** (`.github/workflows/sync-clientes-supabase.yml`). No requiere nada más.

Verificar la corrida:

```bash
gh run list --workflow "Sync Clientes To Supabase" --limit 3
gh run watch   # o gh run view <id> --log-failed
```

## Opción 2 — Disparo manual del workflow

```bash
gh workflow run "Sync Clientes To Supabase"                      # todos los clientes
gh workflow run "Sync Clientes To Supabase" -f cliente=maulemed-2026  # uno solo
```

## Opción 3 — Local

```bash
SUPABASE_URL="https://<proyecto>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
npm run sync:clientes -- maulemed-2026   # sin argumento = todos
```

Bucket por defecto `bpmn` (cambiable con `SUPABASE_BPMN_BUCKET`). La service-role key **jamás** va en código versionado ni en variables `VITE_*`.

## Qué hace el script (`scripts/sync-clientes-supabase.mjs`)

- Recorre `clientes/` (ignora carpetas con prefijo `_`), o solo los slugs pasados por argv.
- Busca la empresa en `public.empresas` por nombre (`ilike` contra `project.json.empresa`). Si no existe, falla → crear primero la empresa (skill `nuevo-cliente`).
- **Borra y re-inserta** el proyecto (Git es la fuente de verdad; no hay merge).
- Escribe: `proyectos`, `proyecto_tareas` (desde `gantt.json`), `procesos`, `proyecto_bpmn` (sube `.bpmn` a Storage), `proceso_informes` (sube PDFs), `proceso_hallazgos` (sube imágenes HAMMER, asocia por `proceso_slug`).

## Verificación post-sync

Con el MCP de Supabase, consultar por ejemplo:

```sql
select p.nombre, count(t.id) tareas from proyectos p left join proyecto_tareas t on t.proyecto_id = p.id group by 1;
select nombre, archivo_url from proyecto_bpmn order by created_at desc limit 5;
```

O entrar a `/portal` con el usuario del cliente.

## Fuente de verdad

`clientes/README.md` (secciones "Sincronización", "Sync Manual Local") y el script mismo.
