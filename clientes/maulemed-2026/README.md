# MauleMed 2026

Cliente de prueba para el portal de levantamiento de procesos.

## Archivos

- `project.json`: datos generales del proyecto.
- `gantt.json`: carta Gantt de junio a julio 2026.
- `procesos.json`: procesos identificados y BPMN asociados.
- `hallazgos.json`: hallazgos del levantamiento.
- `pendientes.json`: pendientes del cliente.
- `bpmn/`: archivos fuente BPMN.

## BPMN Integrados

- `bpmn/Planificacion-y-Control-Financiero.bpmn`
- `bpmn/Ciclo-de-Vida-del-Personal.bpmn`
- `bpmn/Gestion-de-Inventario.bpmn`

## Publicación

Cuando se haga push a `main`, la GitHub Action `Sync Clientes To Supabase` subirá estos BPMN a Supabase Storage y actualizará el portal.

Para sincronización local manual:

```bash
npm run sync:clientes -- maulemed-2026
```

Requiere `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el entorno.
