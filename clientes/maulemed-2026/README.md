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
| 2 | Ciclo de Vida del Personal | 5 | 5 | sí | Informe final |
| 3 | Gestión Comercial y Marketing Digital | 3 | 1 | sí | Informe final |
| 4 | Control e Informes de Gestión Clínica | 1 | 1 | sí | Informe final |
| 5 | Planificación y Control Financiero | 4 | 4 | sí | Informe final |

Total publicado: **14 BPMN · 12 matrices HAMMER · 5 informes**. Los cinco procesos están
completos: no queda nada retenido.

Los procesos 2 y 5 se modelaron por subproceso (A–E y A–D), un diagrama por cada uno, en vez
del diagrama único que se había levantado primero.

## Origen De Los Assets

Nada de esto se genera en este repositorio; acá solo se publica el resultado:

- **BPMN**: `~/Desktop/Methodical/MauleMed-2026/BPMN/` (los de marketing vienen de
  `Proceso Marketing / Encuestas / Reclamos v1.0.bpmn`). Las miniaturas `-preview.svg` que
  acompañan a cada uno se generan desde el propio diagrama con:
  ```bash
  cd ~/Desktop/Methodical/MauleMed-2026/BPMN
  python3 tools/audit_bpmn.py <los .bpmn de este repo> --svg-dir <destino>
  ```
- **Matrices HAMMER**: `~/Desktop/Methodical/MauleMed-2026/Hammer/`, generadas con
  `tools/gen_hammer.py` (arma los .xlsx) y `tools/render_png.py` (los rasteriza a 200 DPI).
  El contenido de cada ficha vive en `tools/contenido_*.py`.
- **Informes**: `~/Desktop/Methodical/MauleMed-2026/Informe/`, compilados por capítulo con
  `tools/build-capitulos.sh` (tectonic + `tools/preambulo-local.tex`). Cada capítulo se compila
  con su número real dentro del informe consolidado, y toma como fuente el `.tex` más reciente:
  los capítulos 2 y 5 se siguen editando sueltos en `Informe/`, el resto sale de
  `Informe/overleaf/procesos/` tal como vino del zip de Overleaf.

## Publicación

Cuando se haga push a `main`, la GitHub Action `Sync Clientes To Supabase` subirá estos
archivos a Supabase Storage y actualizará el portal.

Para sincronización local manual:

```bash
npm run sync:clientes -- maulemed-2026
```

Requiere `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el entorno.
