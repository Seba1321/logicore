-- Seed manual para publicar la Gantt de MauleMed en Supabase.
-- Ejecutar después de `supabase-empresas-login.sql`.
-- No crea ni modifica credenciales; requiere que `public.empresas` ya tenga empresa = 'MauleMed'.

do $$
declare
  v_empresa_id bigint;
  v_proyecto_id bigint;
begin
  select id
  into v_empresa_id
  from public.empresas
  where lower(empresa) = lower('MauleMed')
  limit 1;

  if v_empresa_id is null then
    raise exception 'No existe la empresa MauleMed en public.empresas';
  end if;

  delete from public.proyectos
  where empresa_id = v_empresa_id
    and nombre = 'Levantamiento y modelamiento de procesos MauleMed 2026';

  insert into public.proyectos (
    empresa_id,
    nombre,
    descripcion,
    estado,
    fecha_inicio,
    fecha_fin
  )
  values (
    v_empresa_id,
    'Levantamiento y modelamiento de procesos MauleMed 2026',
    'Seguimiento del levantamiento, análisis Hammer, modelamiento de procesos y entrega del informe final.',
    'en_desarrollo',
    '2026-06-08',
    '2026-08-14'
  )
  returning id into v_proyecto_id;

  insert into public.proyecto_tareas (
    proyecto_id,
    id_git,
    fase,
    titulo,
    descripcion,
    estado,
    responsable,
    fecha_inicio,
    fecha_fin,
    progreso,
    peso,
    orden,
    dependencias
  )
  values
    (
      v_proyecto_id,
      'reunion-inicial-agenda',
      'Inicio',
      'Reunión inicial y acuerdo de agenda de trabajo',
      'Alineamiento inicial con MauleMed, confirmación de alcance, responsables, dueños de proceso y calendario de sesiones de levantamiento.',
      'completada',
      'Cliente + Methodical',
      '2026-06-08',
      '2026-06-12',
      100,
      1,
      1,
      '[]'::jsonb
    ),
    (
      v_proyecto_id,
      'sesiones-levantamiento-duenos',
      'Levantamiento',
      'Sesiones de levantamiento con dueños de proceso',
      'Ejecución de sesiones con cada dueño de proceso para entender flujo actual, roles, entradas, salidas, sistemas, decisiones y principales puntos de dolor.',
      'en_desarrollo',
      'Cliente + Methodical',
      '2026-06-15',
      '2026-07-17',
      0,
      3,
      2,
      '["reunion-inicial-agenda"]'::jsonb
    ),
    (
      v_proyecto_id,
      'bpmn-iniciales',
      'Modelamiento BPMN y diagnóstico',
      'Modelamiento BPMN inicial',
      'Construcción de los primeros diagramas BPMN a partir de las sesiones de levantamiento, incluyendo abastecimiento e inventario, ciclo de vida del personal y planificación financiera.',
      'en_desarrollo',
      'Methodical',
      '2026-07-06',
      '2026-07-24',
      0,
      2,
      3,
      '["sesiones-levantamiento-duenos"]'::jsonb
    ),
    (
      v_proyecto_id,
      'analisis-hammer',
      'Modelamiento BPMN y diagnóstico',
      'Análisis Hammer y diagnóstico de procesos',
      'Aplicación del enfoque Hammer de reingeniería para cuestionar supuestos, identificar quiebres, reprocesos, actividades sin valor y oportunidades de simplificación o rediseño.',
      'pendiente',
      'Methodical',
      '2026-07-06',
      '2026-08-07',
      0,
      2.5,
      4,
      '["sesiones-levantamiento-duenos"]'::jsonb
    ),
    (
      v_proyecto_id,
      'modelamiento-procesos',
      'Modelamiento BPMN y diagnóstico',
      'Modelamiento de procesos priorizados',
      'Modelamiento detallado de procesos priorizados, consolidando BPMN, roles, actividades, decisiones, puntos de control y hallazgos levantados con MauleMed.',
      'pendiente',
      'Methodical',
      '2026-07-06',
      '2026-08-07',
      0,
      3,
      5,
      '["sesiones-levantamiento-duenos", "bpmn-iniciales", "analisis-hammer"]'::jsonb
    ),
    (
      v_proyecto_id,
      'feedback-bpmn',
      'Modelamiento BPMN y diagnóstico',
      'Recepción y revisión de feedback BPMN',
      'Recepción de comentarios de MauleMed sobre los BPMN modelados y registro de ajustes requeridos para cada proceso.',
      'pendiente',
      'Cliente + Methodical',
      '2026-07-20',
      '2026-07-31',
      0,
      1,
      6,
      '["bpmn-iniciales"]'::jsonb
    ),
    (
      v_proyecto_id,
      'feedback-hammer',
      'Modelamiento BPMN y diagnóstico',
      'Feedback del análisis Hammer',
      'Presentación de hallazgos Hammer, validación del diagnóstico y priorización de oportunidades de mejora con el cliente.',
      'pendiente',
      'Cliente + Methodical',
      '2026-07-27',
      '2026-08-07',
      0,
      1.5,
      7,
      '["analisis-hammer"]'::jsonb
    ),
    (
      v_proyecto_id,
      'ajustes-consolidacion',
      'Modelamiento BPMN y diagnóstico',
      'Ajustes y consolidación del levantamiento',
      'Incorporación de feedback, cierre de pendientes, consolidación de BPMN, diagnóstico y preparación de insumos para el informe final.',
      'pendiente',
      'Methodical',
      '2026-08-03',
      '2026-08-07',
      0,
      1.5,
      8,
      '["modelamiento-procesos", "feedback-bpmn", "feedback-hammer"]'::jsonb
    ),
    (
      v_proyecto_id,
      'entrega-informe-final',
      'Cierre',
      'Elaboración y entrega de informe final',
      'Elaboración, revisión y entrega del informe final de levantamiento, modelamiento BPMN, análisis Hammer, diagnóstico y oportunidades detectadas.',
      'pendiente',
      'Methodical',
      '2026-08-10',
      '2026-08-14',
      0,
      1.5,
      9,
      '["ajustes-consolidacion"]'::jsonb
    );
end $$;
