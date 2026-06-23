# Clientes Methodical

Esta carpeta es la fuente administrativa versionada por Git para el portal de clientes.

## Estructura

Cada empresa debe tener su propia carpeta:

```txt
clientes/<cliente-slug>/
  project.json
  gantt.json
  procesos.json
  hallazgos.json
  pendientes.json
  bpmn/
    proceso-principal.bpmn
```

## Flujo Recomendado

1. Crea una carpeta copiando `clientes/_template`.
2. Edita `project.json` con los datos generales del proyecto.
3. Edita `procesos.json` con el mapa de procesos levantados.
4. Edita `gantt.json` con tareas, fechas, estados, pesos y avances.
5. Edita `hallazgos.json` y `pendientes.json` según corresponda.
6. Guarda diagramas BPMN en `bpmn/`.
7. Haz commit y push.
8. Sincroniza esos datos hacia Supabase para que aparezcan en el portal.

## Crear Un Nuevo Cliente

1. Copia `clientes/_template` a `clientes/<cliente-slug>`.
2. Cambia `empresa` y `usuario` en `project.json` para que coincidan con `public.empresas` en Supabase.
3. Define `proyecto.fecha_inicio` y `proyecto.fecha_fin`.
4. Completa `gantt.json` con las tareas del proyecto.
5. Completa `procesos.json` cuando existan procesos levantados.
6. Agrega archivos `.bpmn` dentro de `bpmn/`.
7. Deja `archivo_url` como `null`; el script de sync lo sube a Supabase Storage y genera la URL pública.
8. Mantén `hallazgos.json` y `pendientes.json` actualizados durante el levantamiento.

## Estandar BPMN

Los BPMN se versionan como archivos fuente dentro de cada cliente:

```txt
clientes/<cliente-slug>/bpmn/<nombre-del-proceso>.bpmn
```

Reglas:

- Usa extensión `.bpmn`.
- Usa nombres claros en ASCII, idealmente `kebab-case` o `Pascal-Con-Guiones`.
- No subas visualizadores HTML generados; el portal ya tiene visor `bpmn-js`.
- Cada BPMN debe estar asociado a un proceso en `procesos.json`.
- `archivo_path` siempre es relativo a la carpeta del cliente.
- `archivo_url` debe quedar `null` en Git, salvo que quieras forzar una URL externa.

Ejemplo:

```json
{
  "slug": "ciclo-vida-personal",
  "nombre": "Ciclo de Vida del Personal",
  "area": "Recursos Humanos",
  "estado": "modelado",
  "bpmn": [
    {
      "nombre": "Ciclo de Vida del Personal",
      "descripcion": "Diagrama BPMN del proceso de personas.",
      "archivo_path": "bpmn/Ciclo-de-Vida-del-Personal.bpmn",
      "archivo_url": null
    }
  ]
}
```

## Estados Sugeridos

Usa nombres simples y consistentes:

```txt
planificacion
pendiente
en_desarrollo
en_revision
bloqueada
completada
```

## Estandar Gantt

`gantt.json` es el archivo base para calcular avance y dibujar la carta Gantt.

Campos de nivel superior:

- `version`: versión del estándar del archivo.
- `periodo.fecha_inicio`: fecha inicial del proyecto en formato `YYYY-MM-DD`.
- `periodo.fecha_fin`: fecha final del proyecto en formato `YYYY-MM-DD`.
- `periodo.zona_horaria`: normalmente `America/Santiago`.
- `calculo_avance.metodo`: por ahora `promedio_ponderado`.
- `tareas`: lista de tareas o hitos.

Campos por tarea:

- `id_git`: identificador estable para dependencias y sincronización.
- `fase`: agrupador visual, por ejemplo `BPMN`, `Hammer`, `Modelamiento`, `Cierre`.
- `titulo`: nombre visible en el portal.
- `descripcion`: detalle breve de la tarea.
- `estado`: `pendiente`, `en_desarrollo`, `en_revision`, `bloqueada` o `completada`.
- `responsable`: `Methodical`, `Cliente` o `Cliente + Methodical`.
- `fecha_inicio`: inicio en formato `YYYY-MM-DD`.
- `fecha_fin`: término en formato `YYYY-MM-DD`.
- `progreso`: número de `0` a `100`.
- `peso`: importancia relativa de la tarea para el avance total.
- `orden`: orden visual en el portal.
- `dependencias`: lista de `id_git` que deben ocurrir antes.

Formula de avance:

```txt
avance_total = sum(tarea.progreso * tarea.peso) / sum(tarea.peso)
```

Ejemplo: si una tarea pesa `3`, impacta tres veces más que una tarea con peso `1`.

## Metodología Hammer

Para tareas tipo `Hammer`, usar el enfoque de reingeniería de procesos asociado a Michael Hammer:

- Cuestionar supuestos del proceso actual.
- Identificar actividades sin valor agregado.
- Detectar quiebres, reprocesos y esperas.
- Revisar handoffs entre áreas.
- Proponer simplificación o rediseño cuando corresponda.
- Transformar hallazgos en oportunidades concretas para el informe final.

## MauleMed 2026

El primer cliente de prueba queda en:

```txt
clientes/maulemed-2026/
```

Su Gantt cubre desde `2026-06-22` hasta `2026-07-24`:

- Semana del 22 de junio: BPMN iniciales y feedback.
- Semana del 29 de junio: análisis Hammer.
- Semana del 6 de julio: feedback de Hammer.
- Del 3 al 17 de julio: modelamiento de procesos.
- 24 de julio: entrega del informe final.

Para cargar esta Gantt manualmente en Supabase, ejecuta:

```txt
clientes/maulemed-2026/supabase-seed.sql
```

Ese seed recrea el proyecto de MauleMed y sus tareas. No modifica credenciales.

## Sincronización

El portal lee desde Supabase. Git es la fuente administrativa. Al hacer push a `main`, GitHub Actions ejecuta:

```txt
npm run sync:clientes
```

La sincronización hace lo siguiente:

- Lee todos los clientes en `clientes/`, excepto carpetas que comienzan con `_`.
- Busca la empresa en `public.empresas`.
- Recrea el proyecto con el mismo nombre para que Git sea la fuente de verdad.
- Carga tareas desde `gantt.json`.
- Carga procesos desde `procesos.json`.
- Sube BPMN a Supabase Storage en el bucket `bpmn`.
- Guarda la URL pública del BPMN en `public.proyecto_bpmn.archivo_url`.
- Carga hallazgos y pendientes asociados por `proceso_slug`.

Antes del primer sync, ejecuta `supabase-empresas-login.sql` en Supabase.

## Secretos De GitHub

Configura estos secretos en GitHub Actions:

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

No uses `SUPABASE_SERVICE_ROLE_KEY` en React ni la pegues en archivos versionados. Solo debe existir como secreto de GitHub o variable local temporal.

## Sync Manual Local

Para sincronizar un cliente específico desde tu máquina:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key" \
npm run sync:clientes -- maulemed-2026
```

Para sincronizar todos:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key" \
npm run sync:clientes
```

El script usa el bucket `bpmn` por defecto. Puedes cambiarlo con `SUPABASE_BPMN_BUCKET`.
