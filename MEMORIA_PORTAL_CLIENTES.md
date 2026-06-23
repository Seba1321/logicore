# Memoria Portal De Clientes Methodical

## Contexto General

Se creó un portal privado para empresas clientes de Methodical en `/portal`.

El portal permite que una empresa ingrese con nombre de empresa o usuario y contraseña. La autenticación se valida contra Supabase usando RPC, sin leer directamente las tablas desde el frontend.

El objetivo del portal es mostrar el avance del levantamiento de procesos, carta Gantt, procesos modelados, hallazgos, pendientes del cliente y BPMN visualizables con `bpmn-js`.

## Stack Actual

- React + Vite + TypeScript.
- Tailwind/shadcn UI existente.
- Supabase como backend.
- Git como fuente administrativa de datos de clientes.
- GitHub Actions para sincronizar `clientes/**` hacia Supabase.
- `bpmn-js` para visualizar diagramas BPMN en el portal.

## Archivos Clave

- `src/pages/Portal.tsx`: página principal del portal.
- `src/components/portal/BpmnViewer.tsx`: visor BPMN.
- `src/lib/supabase.ts`: cliente Supabase y tipos del portal.
- `supabase-empresas-login.sql`: schema/RPC del portal.
- `scripts/sync-clientes-supabase.mjs`: sincronización Git -> Supabase.
- `.github/workflows/sync-clientes-supabase.yml`: workflow de GitHub Actions.
- `clientes/README.md`: estándar para nuevos clientes.
- `clientes/_template/`: template base para clientes nuevos.
- `clientes/maulemed-2026/`: cliente de prueba MauleMed.

## Supabase

Tabla base creada manualmente:

```sql
create table public.empresas (
    id bigint generated always as identity primary key,
    empresa varchar(255) not null unique,
    usuario varchar(100) not null unique,
    password varchar(255) not null,
    activo boolean default true,
    created_at timestamptz default now()
);

alter table public.empresas enable row level security;
```

Luego se agregó, mediante `supabase-empresas-login.sql`:

- `empresa_sessions`
- `proyectos`
- `proyecto_tareas`
- `procesos`
- `proyecto_bpmn`
- `proceso_hallazgos`
- `proceso_pendientes`
- RPC `login_empresa`
- RPC `get_portal_empresa`
- RPC `logout_empresa`

La contraseña debe guardarse hasheada con `extensions.crypt(..., extensions.gen_salt('bf'))`.

## Login

El portal permite ingresar con:

- Nombre de empresa.
- Usuario.

La RPC `login_empresa` compara contra `empresa` o `usuario` y devuelve:

- `id`
- `empresa`
- `usuario`
- `session_token`
- `expires_at`

El token se usa para llamar `get_portal_empresa`.

## Cliente MauleMed

Los BPMN originales estaban en:

```txt
~/Desktop/Methodical/MauleMed-2026/BPMN
```

Se copiaron al repo:

```txt
clientes/maulemed-2026/bpmn/Planificacion-y-Control-Financiero.bpmn
clientes/maulemed-2026/bpmn/Ciclo-de-Vida-del-Personal.bpmn
```

Se registraron en:

```txt
clientes/maulemed-2026/procesos.json
```

La carta Gantt de MauleMed está en:

```txt
clientes/maulemed-2026/gantt.json
```

Periodo:

- Inicio: `2026-06-22`
- Fin: `2026-07-24`

Hitos:

- Semana del 22 de junio: BPMN iniciales y feedback.
- Semana del 29 de junio: análisis Hammer.
- Semana del 6 de julio: feedback Hammer.
- Del 3 al 17 de julio: modelamiento de procesos.
- 24 de julio: entrega del informe final.

## Estandar Git Para Clientes

Cada cliente debe vivir en:

```txt
clientes/<cliente-slug>/
  project.json
  gantt.json
  procesos.json
  hallazgos.json
  pendientes.json
  bpmn/
```

Los BPMN se guardan en `bpmn/` y se referencian desde `procesos.json` con `archivo_path`. `archivo_url` puede quedar `null`; el sync sube el archivo a Supabase Storage y guarda la URL pública.

## GitHub Actions

Workflow:

```txt
.github/workflows/sync-clientes-supabase.yml
```

Se ejecuta en push a `main` cuando cambian:

- `clientes/**`
- `scripts/sync-clientes-supabase.mjs`
- `supabase-empresas-login.sql`

También puede ejecutarse manualmente con `workflow_dispatch` y parámetro opcional `cliente`.

## Secretos Necesarios En GitHub

En el repo de GitHub configurar:

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` nunca debe ir en el frontend ni versionarse.

## Comandos Utiles

Build:

```bash
npm run build
```

Tests:

```bash
npm test
```

Sync local de un cliente:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key" \
npm run sync:clientes -- maulemed-2026
```

Sync local de todos los clientes:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key" \
npm run sync:clientes
```

## Estado De Verificacion

Verificaciones realizadas durante la implementación:

- `npm run build`: OK.
- `npm test`: OK.
- `node --check scripts/sync-clientes-supabase.mjs`: OK.
- Validación JSON clientes: OK.

`npm run lint` falla por errores preexistentes en componentes UI generados y `tailwind.config.ts`, no por el portal.

## Pendientes Naturales

1. Ejecutar `supabase-empresas-login.sql` actualizado en Supabase si aún no está aplicado.
2. Configurar secretos de GitHub Actions.
3. Ejecutar manualmente `Sync Clientes To Supabase` para `maulemed-2026`.
4. Confirmar que los BPMN queden en Supabase Storage bucket `bpmn`.
5. Entrar al portal y validar que el selector BPMN cargue ambos diagramas.
6. Luego automatizar o documentar migraciones SQL más formalmente.
