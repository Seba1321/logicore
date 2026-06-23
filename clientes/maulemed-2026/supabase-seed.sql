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
    '2026-06-22',
    '2026-07-24'
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
      'bpmn-iniciales',
      'BPMN',
      'Modelamiento BPMN inicial',
      'Construcción de los primeros diagramas BPMN del levantamiento para alinear flujo actual y puntos de decisión.',
      'en_desarrollo',
      'Methodical',
      '2026-06-22',
      '2026-06-26',
      0,
      2,
      1,
      '[]'::jsonb
    ),
    (
      v_proyecto_id,
      'feedback-bpmn',
      'BPMN',
      'Recepción y revisión de feedback BPMN',
      'Recepción de comentarios del cliente sobre los BPMN iniciales y registro de ajustes requeridos.',
      'pendiente',
      'Cliente + Methodical',
      '2026-06-26',
      '2026-06-28',
      0,
      1,
      2,
      '["bpmn-iniciales"]'::jsonb
    ),
    (
      v_proyecto_id,
      'analisis-hammer',
      'Hammer',
      'Análisis Hammer del proceso',
      'Aplicación de enfoque Hammer de reingeniería: cuestionar supuestos, identificar quiebres, actividades sin valor y oportunidades de rediseño radical o simplificación.',
      'pendiente',
      'Methodical',
      '2026-06-29',
      '2026-07-05',
      0,
      2,
      3,
      '["feedback-bpmn"]'::jsonb
    ),
    (
      v_proyecto_id,
      'modelamiento-procesos',
      'Modelamiento',
      'Modelamiento de procesos priorizados',
      'Modelamiento detallado de los procesos priorizados, incorporando hallazgos del levantamiento y criterios del análisis Hammer.',
      'pendiente',
      'Methodical',
      '2026-07-03',
      '2026-07-17',
      0,
      3,
      4,
      '["bpmn-iniciales", "analisis-hammer"]'::jsonb
    ),
    (
      v_proyecto_id,
      'feedback-hammer',
      'Hammer',
      'Feedback del análisis Hammer',
      'Presentación de hallazgos Hammer, recepción de feedback y priorización de ajustes al modelamiento.',
      'pendiente',
      'Cliente + Methodical',
      '2026-07-06',
      '2026-07-12',
      0,
      1.5,
      5,
      '["analisis-hammer"]'::jsonb
    ),
    (
      v_proyecto_id,
      'ajustes-consolidacion',
      'Cierre',
      'Ajustes y consolidación del levantamiento',
      'Incorporación de feedback, cierre de pendientes y preparación de insumos para el informe final.',
      'pendiente',
      'Methodical',
      '2026-07-18',
      '2026-07-23',
      0,
      1.5,
      6,
      '["modelamiento-procesos", "feedback-hammer"]'::jsonb
    ),
    (
      v_proyecto_id,
      'entrega-informe-final',
      'Cierre',
      'Entrega de informe final',
      'Entrega del informe final de levantamiento, modelamiento y oportunidades detectadas.',
      'pendiente',
      'Methodical',
      '2026-07-24',
      '2026-07-24',
      0,
      1,
      7,
      '["ajustes-consolidacion"]'::jsonb
    );
end $$;
