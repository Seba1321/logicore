---
name: verificar
description: Correr localmente las mismas verificaciones que el CI (lint, typecheck, tests, build) antes de un push a main. Usar antes de commitear cambios de código o cuando se pida verificar/validar que el proyecto compila y pasa tests.
---

# Verificación local (réplica del CI)

El CI (`.github/workflows/ci.yml`) corre en cada push/PR a `main`. Reproducirlo local antes de pushear:

```bash
npx eslint src          # lint (el CI lintea solo src/)
npx tsc --noEmit        # typecheck (no lo corre el build!)
npx vitest run          # tests
npm run build           # vite build → docs/ + copia 404.html
```

Notas:

- `npm run build` **no hace typecheck** — correr `tsc --noEmit` siempre; es la falla más fácil de dejar pasar.
- El build escribe en `docs/` (GitHub Pages). Si el cambio es de código de la app y va a `main`, el build regenerado en `docs/` debe commitearse → skill `deploy`.
- Scripts equivalentes de package.json: `npm run lint` (lintea todo, no solo src), `npm run typecheck`, `npm test`.
- Para probar visualmente: `npm run dev` (Vite) y revisar la ruta afectada; el portal necesita `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` en `.env` (ver `.env.example`).

Un cambio solo en `clientes/**` no necesita build ni tests: eso lo maneja el sync (skill `sync-clientes`).
