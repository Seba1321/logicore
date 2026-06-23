# Methodical

Sitio web corporativo de **Methodical** (consultora de procesos) con un **portal privado
de clientes** para seguir el avance de cada levantamiento: carta Gantt, procesos, hallazgos,
pendientes y diagramas BPMN.

- **Frontend:** Vite + React + TypeScript + Tailwind (shadcn/ui).
- **Backend del portal:** Supabase (RPC + RLS). El frontend nunca lee tablas directamente.
- **Fuente de datos de clientes:** Git. La carpeta `clientes/**` es la fuente administrativa
  y se sincroniza hacia Supabase con GitHub Actions.
- **Deploy:** GitHub Pages desde `docs/` (build output versionado).

## Estructura

```txt
src/
  pages/            Index (landing), Portal, BpmnViewerPage, Visit, NotFound
  components/
    sections/       Secciones de la landing (Hero, Servicios, Equipo, Contacto, ...)
    portal/         BpmnViewer (visor bpmn-js)
    ui/             Primitivas shadcn en uso (button, input, label, toast, tooltip, ...)
  lib/              supabase (cliente + tipos), portal-session, utils
  hooks/            use-toast, use-mobile
clientes/           Fuente administrativa por cliente (ver clientes/README.md)
scripts/            sync-clientes-supabase.mjs (Git -> Supabase)
docs/               Build de producción para GitHub Pages
supabase-empresas-login.sql   Schema + RPC del portal
```

## Desarrollo

Requiere Node.js. Instala dependencias y levanta el dev server:

```bash
npm install
npm run dev
```

Variables de entorno (copia `.env.example` a `.env`):

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...   # o VITE_SUPABASE_ANON_KEY
```

El portal funciona sin estas variables, pero el login no validará hasta configurarlas.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción a `docs/` (+ fallback SPA `404.html`). |
| `npm run typecheck` | Chequeo de tipos con `tsc` (no lo hace `build`). |
| `npm run lint` | ESLint. |
| `npm test` | Tests con Vitest. |
| `npm run sync:clientes` | Sincroniza `clientes/**` hacia Supabase (ver abajo). |

## Portal de clientes

El portal vive en `/portal`. Una empresa ingresa con nombre de empresa o usuario y contraseña;
la autenticación se valida en Supabase con la RPC `login_empresa` (contraseñas con bcrypt,
RLS activo). El token de sesión se usa para `get_portal_empresa`, que devuelve proyectos,
tareas, procesos, hallazgos, pendientes y BPMN.

**Datos de un cliente** (Git como fuente de verdad): cada empresa vive en
`clientes/<slug>/` con `project.json`, `gantt.json`, `procesos.json`, `hallazgos.json`,
`pendientes.json` y una carpeta `bpmn/`. El estándar completo está en
[`clientes/README.md`](clientes/README.md).

**Sincronización a Supabase:** al hacer push a `main`, el workflow
`.github/workflows/sync-clientes-supabase.yml` ejecuta `npm run sync:clientes`. También
puede correrse localmente:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key" \
npm run sync:clientes -- maulemed-2026   # omite el slug para sincronizar todos
```

> `SUPABASE_SERVICE_ROLE_KEY` solo se usa en scripts/CI. Nunca debe ir en el frontend ni
> versionarse: configúrala como secret de GitHub (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

### Puesta en marcha del portal (una vez)

1. Ejecuta `supabase-empresas-login.sql` en el editor SQL de Supabase (esquema + RPC).
2. Configura los secrets `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en GitHub Actions.
3. Para cada cliente nuevo, crea su empresa con `supabase-crear-empresa.sql` (edita 3
   valores y ejecútalo en el editor SQL) y luego haz el primer sync desde Git.

Más contexto de diseño en [`MEMORIA_PORTAL_CLIENTES.md`](MEMORIA_PORTAL_CLIENTES.md).
</content>
