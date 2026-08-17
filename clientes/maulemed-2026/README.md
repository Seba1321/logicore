# MauleMed 2026

Levantamiento y modelamiento de procesos. Proyecto **cerrado** el 14 de agosto de 2026.

## Archivos

- `project.json`: datos generales del proyecto.
- `gantt.json`: carta Gantt de 10 semanas, desde el lunes 8 de junio hasta el viernes 14 de agosto de 2026.
- `procesos.json`: procesos identificados, BPMN e informes asociados.
- `hallazgos.json`: hallazgos del análisis HAMMER (imágenes).
- `bpmn/`: archivos fuente BPMN.
- `hammer/`: matrices de madurez del análisis HAMMER.
- `informes/`: informes finales en PDF, uno por capítulo.

## Estado Por Proceso

| # | Proceso | BPMN | HAMMER | Informe | Etapa en el portal |
|---|---------|------|--------|---------|--------------------|
| 1 | Gestión de Abastecimiento e Inventario | 1 | 1 | sí | Informe final |
| 2 | Ciclo de Vida del Personal | — | 5 | sí | Informe final |
| 3 | Gestión Comercial y Marketing Digital | 3 | 1 | sí | Informe final |
| 4 | Control e Informes de Gestión Clínica | 1 | 1 | sí | Informe final |
| 5 | Planificación y Control Financiero | — | 4 | — | Análisis HAMMER |

Total publicado: **5 BPMN · 12 matrices HAMMER · 4 informes**.

## Pendientes De Publicación

Dos entregables quedaron retenidos a propósito y no están referenciados en `procesos.json`:

- **BPMN de Ciclo de Vida del Personal** (5 subprocesos) y **de Planificación y Control
  Financiero** (4 subprocesos). Los diagramas por subproceso existen en
  `~/Desktop/Methodical/MauleMed-2026/BPMN/`, pero se van a mejorar antes de mostrarlos al
  cliente. Las versiones antiguas de un solo diagrama están guardadas en `bpmn/_pendientes/`.
- **Informe del capítulo 5** (Planificación y Control Financiero). El PDF se compila con
  `~/Desktop/Methodical/MauleMed-2026/Informe/tools/build-capitulos.sh` agregando la línea
  del capítulo 05, que hoy está fuera del script a propósito.

Al publicar cualquiera de los dos, el proceso correspondiente sube de etapa solo: basta
referenciarlo en `procesos.json` y hacer push.

## Origen De Los Assets

Nada de esto se genera en este repositorio; acá solo se publica el resultado:

- **BPMN**: `~/Desktop/Methodical/MauleMed-2026/BPMN/` (los de marketing vienen de
  `Proceso Marketing / Encuestas / Reclamos v1.0.bpmn`).
- **Matrices HAMMER**: `~/Desktop/Methodical/MauleMed-2026/Hammer/`, generadas con
  `tools/gen_hammer.py` (arma los .xlsx) y `tools/render_png.py` (los rasteriza a 200 DPI).
  El contenido de cada ficha vive en `tools/contenido_*.py`.
- **Informes**: `~/Desktop/Methodical/MauleMed-2026/Informe/`, compilados por capítulo con
  `tools/build-capitulos.sh` (tectonic + `tools/preambulo-local.tex`) desde el proyecto de
  Overleaf descomprimido en `Informe/overleaf/`.

## Publicación

Cuando se haga push a `main`, la GitHub Action `Sync Clientes To Supabase` subirá estos
archivos a Supabase Storage y actualizará el portal.

Para sincronización local manual:

```bash
npm run sync:clientes -- maulemed-2026
```

Requiere `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el entorno.
