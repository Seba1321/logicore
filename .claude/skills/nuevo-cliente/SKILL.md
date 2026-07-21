---
name: nuevo-cliente
description: Dar de alta un cliente nuevo en el portal — crear carpeta en clientes/ desde la plantilla, registrar la empresa en Supabase y correr el primer sync. Usar cuando se pida crear, agregar o dar de alta un cliente/empresa nueva.
---

# Alta de un cliente nuevo

Git es la fuente administrativa; el portal lee de Supabase. El único paso manual en Supabase es crear la empresa (login); todo lo demás lo carga el sync desde `clientes/`.

## Pasos

1. **Copiar la plantilla**: `cp -r clientes/_template clientes/<cliente-slug>` (slug en kebab-case, p. ej. `maulemed-2026`).
2. **Editar `project.json`**: `empresa` y `usuario` deben calzar **exactamente** con lo que se registrará en `public.empresas` (el sync busca la empresa por nombre con `ilike`). Definir `proyecto.nombre`, `descripcion`, `estado`, `fecha_inicio` y `fecha_fin` (formato `YYYY-MM-DD`).
3. **Completar `gantt.json`** con las tareas del proyecto → ver skill `actualizar-gantt`.
4. **Completar `procesos.json`** cuando existan procesos levantados → ver skill `actualizar-procesos`. Puede partir con arrays `bpmn: []` e `informes: []`.
5. **Dejar `hallazgos.json`** como `{"hallazgos": []}` hasta que haya análisis HAMMER → ver skill `agregar-hallazgos`.
6. **Registrar la empresa en Supabase**: usar `supabase-crear-empresa.sql` (raíz del repo) en el SQL Editor del dashboard, editando solo los 3 valores del bloque "DATOS DE LA EMPRESA" (empresa, usuario, password). La contraseña queda cifrada con bcrypt. Re-ejecutar con el mismo `usuario` no duplica: actualiza y resetea la contraseña.
7. **Commit + push a `main`**: el push que toca `clientes/**` dispara la GitHub Action `Sync Clientes To Supabase` automáticamente → ver skill `sync-clientes`.
8. **Verificar**: entrar a `/portal` con el usuario/contraseña creados y confirmar que aparece el proyecto, la Gantt y los procesos.

## Reglas clave

- `empresa` y `usuario` son únicos entre clientes.
- `archivo_url` siempre `null` en Git; el sync sube archivos a Storage y genera la URL pública.
- Carpetas que empiezan con `_` (como `_template`) se ignoran en el sync.
- Nunca poner `SUPABASE_SERVICE_ROLE_KEY` en archivos versionados.

## Fuente de verdad

- Estándar completo: `clientes/README.md`.
- SQL de alta: `supabase-crear-empresa.sql`.
- Ejemplo real: `clientes/maulemed-2026/`.
