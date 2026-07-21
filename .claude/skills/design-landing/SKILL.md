---
name: design-landing
description: Sistema de diseño y reglas de copy del sitio Methodical — componentes compartidos (SectionHeader, Reveal, CornerTicks), estética blueprint navy/azul, y qué NO reintroducir. Usar al crear o modificar secciones de la landing, páginas públicas o textos del sitio.
---

# Diseño y copy del sitio Methodical

## Estética

Look "blueprint técnico" inspirado en Sui: fondo claro con acentos **navy oscuro + azul**, eyebrows en **monospace** uppercase con tracking amplio, títulos en `font-display`, detalles técnicos (ticks de esquina, puntos, índices numerados `01 — SECCIÓN`).

## Componentes compartidos (reusar, no reinventar)

| Componente | Dónde | Uso |
|---|---|---|
| `SectionHeader` | `src/components/sections/shared.tsx` | Encabezado estándar de sección: `index` ("01"), `eyebrow`, `title`, `lead?`, `align`, `tone` (`light`/`dark`) |
| `Reveal` | `src/components/portal/technical.tsx` | Animación de entrada al hacer scroll (envuelve contenido) |
| `CornerTicks` | `src/components/portal/technical.tsx` | Ticks decorativos de esquina estilo blueprint |
| `CountUp` | `src/components/portal/technical.tsx` | Números animados |

Secciones de la landing en `src/components/sections/` (Hero, Services, WhyUs, Projects, Team, Contact, Header, Footer). Datos estáticos en `src/data/` (`team.ts`, `projects.ts`).

## Reglas de copy

- **No mencionar** cofundadores ni universidades; el ángulo es **"equipo joven"**.
- Modal de equipo: solo LinkedIn, sin email (Jimmy no tiene LinkedIn).
- Tono: técnico, directo, en español.

## Elementos eliminados a propósito — NO reintroducir

- Bandas de sectores en Hero/WhyUs
- Fila de stats
- Chips de stack tecnológico
- Sección manifesto
- Badge de respuesta "<24h"

## Layout global

Rutas y code-splitting en `src/App.tsx`; el Header es visible en todas las rutas **excepto `/portal`**. `ScrollToTop` soporta anclas con hash.
