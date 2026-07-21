---
name: portal-debug
description: Mapa del portal de clientes para depurar — login/sesión, RPCs de Supabase, cálculo de avance, Gantt y visor BPMN. Usar cuando algo falla en /portal, el login no funciona, no aparecen datos, o el visor BPMN no carga.
---

# Debug del portal de clientes

## Arquitectura en 30 segundos

- El frontend **nunca lee tablas directo**: solo llama RPCs de Supabase (SECURITY DEFINER). Cliente creado en `src/lib/supabase.ts` con `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (fallback `VITE_SUPABASE_ANON_KEY`); si faltan, `supabase` es `null` y `isSupabaseConfigured` es `false` (el portal muestra estado "no configurado").
- RPCs: `login_empresa(p_usuario, p_password)` → `{id, empresa, usuario, session_token, expires_at}`; `get_portal_empresa(p_session_token)` → `PortalData` completo; `logout_empresa(p_session_token)`. Definidas en `supabase-empresas-login.sql`.
- Sesión: `src/lib/portal-session.ts`, en `localStorage` bajo `methodical.portal.session` (token + expiración). Passwords bcrypt server-side.

## Archivos clave

| Qué | Dónde |
|---|---|
| Página principal del portal (login, métricas, Gantt) | `src/pages/Portal.tsx` |
| Visor BPMN (ruta `/portal/bpmn/:diagramId`) | `src/pages/BpmnViewerPage.tsx` |
| Componente visor (bpmn-js NavigatedViewer, zoom, stats) | `src/components/portal/BpmnViewer.tsx` |
| Tipos (`PortalData`, `PortalTask`, `PortalProcess`, …) | `src/lib/supabase.ts` |
| Schema + RPCs SQL | `supabase-empresas-login.sql` |

## Comportamientos que confunden (no son bugs)

- **Avance por tiempo**: el % de avance se calcula por fechas (completada=100, futura=0, en curso proporcional al tiempo transcurrido), ponderado por `peso` — no por el campo `progreso` del JSON.
- **Etapa del proceso derivada**: informe → "Informe final"; hallazgo → "Análisis HAMMER"; BPMN → "Construyendo BPMN"; nada → "Por levantar". El `estado` de `procesos.json` no afecta.
- **Datos desactualizados**: el portal lee Supabase; si el JSON cambió pero no hubo sync, no se refleja (skill `sync-clientes`).
- El visor BPMN muestra el **responsable nominal del proceso**, y carga el XML desde la URL pública de Storage — si el bucket `bpmn` no es público o la URL quedó vieja, falla la carga.

## Diagnóstico típico

1. Login falla → ¿empresa `activo=true` en `public.empresas`? ¿password reseteada? (`supabase-crear-empresa.sql` tiene helpers).
2. Portal vacío → probar el RPC directo con el MCP de Supabase: `select * from empresas;` y revisar que el sync corrió (`gh run list --workflow "Sync Clientes To Supabase"`).
3. Sesión expirada/corrupta → borrar `localStorage['methodical.portal.session']` y reloguear.
4. BPMN no carga → verificar `archivo_url` en `proyecto_bpmn` y que el archivo exista en Storage.
