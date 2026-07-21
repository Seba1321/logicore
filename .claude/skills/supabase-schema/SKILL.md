---
name: supabase-schema
description: Referencia del esquema Supabase del portal — tablas, RPCs, Storage y dónde vive el SQL fuente. Usar cuando se necesite consultar o modificar la base de datos del portal, escribir SQL, o entender qué tabla alimenta qué parte del portal.
---

# Esquema Supabase del portal

## Regla de oro

El frontend **solo usa RPCs** (`login_empresa`, `get_portal_empresa`, `logout_empresa`) — nunca lee tablas directo. El acceso con service-role (escritura de datos) solo existe en el script de sync y en el SQL Editor. Cambios de schema se hacen editando el SQL fuente y aplicándolo en Supabase, no al revés: el SQL versionado debe seguir siendo la verdad.

## SQL fuente (repo)

| Archivo | Contenido |
|---|---|
| `supabase-empresas-login.sql` | Schema completo + RPCs. Ejecutar antes del primer sync. |
| `supabase-crear-empresa.sql` | Alta/reset de una empresa (login del portal). |
| `clientes/<slug>/supabase-seed.sql` | Seed manual opcional por cliente (p. ej. maulemed-2026). |

## Tablas (`public`)

| Tabla | Qué guarda | Quién escribe |
|---|---|---|
| `empresas` | login del portal (`empresa`, `usuario`, `password` bcrypt, `activo`) | manual (SQL) |
| `empresa_sessions` | tokens de sesión con expiración | RPCs |
| `proyectos` | proyecto por empresa (borrado y re-insertado en cada sync) | sync |
| `proyecto_tareas` | tareas Gantt (desde `gantt.json`) | sync |
| `procesos` | procesos levantados (desde `procesos.json`) | sync |
| `proyecto_bpmn` | diagramas BPMN + `archivo_url` público; `proceso_id` liga al proceso | sync |
| `proceso_informes` | informes PDF finales por proceso | sync |
| `proceso_hallazgos` | imágenes HAMMER por proceso (asociadas por `proceso_slug`) | sync |
| `proceso_pendientes` | existe en el SQL pero **el pipeline actual no la alimenta** (estándar viejo) | — |

Borrar una empresa cascadea a sus proyectos.

## Storage

Bucket público `bpmn` (configurable con `SUPABASE_BPMN_BUCKET`). El sync sube ahí BPMN, PDFs de informes e imágenes HAMMER bajo `<cliente-slug>/...` y guarda la URL pública en la tabla correspondiente.

## Cómo consultar

Usar el MCP de Supabase configurado en `.mcp.json` (o el SQL Editor del dashboard). Las credenciales frontend van en `.env` como `VITE_*` (ver `.env.example`); la service-role key solo como secreto de GitHub o variable local temporal.
