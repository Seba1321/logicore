---
name: deploy
description: Publicar el sitio — build de Vite commiteado en docs/ y servido por GitHub Pages, con fallback SPA. Usar cuando se pida deployar, publicar cambios del sitio, o cuando un cambio de código no se ve en producción.
---

# Deploy del sitio (GitHub Pages vía docs/)

El sitio se sirve desde la carpeta **`docs/` commiteada en `main`** (GitHub Pages). No hay pipeline de deploy: publicar = build + commit + push.

## Pasos

1. Verificar el código primero (skill `verificar`).
2. `npm run build` — Vite compila a `docs/` y `spa-fallback` copia `docs/index.html` → `docs/404.html` (fallback SPA para rutas como `/portal` con GitHub Pages).
3. Commitear el código **y** el `docs/` regenerado juntos, push a `main`.

## Reglas

- **Nunca editar `docs/` a mano**: es output generado; cualquier cambio manual se pierde en el próximo build.
- Un cambio en `src/` que no viene acompañado de rebuild de `docs/` **no llega a producción** — es el error clásico.
- Las variables `VITE_*` se hornean en el build: el build de producción necesita `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` presentes al compilar (ver `.env.example`). Jamás `SUPABASE_SERVICE_ROLE_KEY` en el frontend.
- Los datos de clientes NO se deployan así: viven en Supabase vía sync (skill `sync-clientes`).

## Verificación

Tras el push, esperar el deploy de Pages y revisar el sitio publicado (landing y `/portal`). `git log docs/` sirve para confirmar cuándo fue el último build publicado.
