-- Run this file in the Supabase SQL editor.
-- Keep RLS enabled. The frontend calls RPC functions and never reads tables directly.

create extension if not exists pgcrypto with schema extensions;

-- Base table created by the project:
-- public.empresas(id, empresa, usuario, password, activo, created_at)

-- If plaintext passwords were inserted while testing, this hashes them once.
-- It skips values that already look like bcrypt hashes.
update public.empresas
set password = extensions.crypt(password, extensions.gen_salt('bf'))
where password is not null
  and password !~ '^[$]2[abxy][$]';

create table if not exists public.empresa_sessions (
  token uuid primary key default extensions.gen_random_uuid(),
  empresa_id bigint not null references public.empresas(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '8 hours')
);

create table if not exists public.proyectos (
  id bigint generated always as identity primary key,
  empresa_id bigint not null references public.empresas(id) on delete cascade,
  nombre varchar(255) not null,
  descripcion text,
  estado varchar(60) not null default 'planificacion',
  fecha_inicio date,
  fecha_fin date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proyecto_tareas (
  id bigint generated always as identity primary key,
  proyecto_id bigint not null references public.proyectos(id) on delete cascade,
  titulo varchar(255) not null,
  descripcion text,
  estado varchar(60) not null default 'pendiente',
  responsable varchar(255),
  fecha_inicio date,
  fecha_fin date,
  progreso numeric(5,2) not null default 0,
  peso numeric(8,2) not null default 1,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proyecto_tareas
add column if not exists id_git text,
add column if not exists fase varchar(120),
add column if not exists dependencias jsonb not null default '[]'::jsonb;

create table if not exists public.procesos (
  id bigint generated always as identity primary key,
  proyecto_id bigint not null references public.proyectos(id) on delete cascade,
  slug varchar(180),
  nombre varchar(255) not null,
  area varchar(120),
  estado varchar(60) not null default 'identificado',
  responsable_methodical varchar(255),
  responsable_cliente varchar(255),
  descripcion text,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.procesos
add column if not exists slug varchar(180);

create table if not exists public.proyecto_bpmn (
  id bigint generated always as identity primary key,
  proyecto_id bigint not null references public.proyectos(id) on delete cascade,
  nombre varchar(255) not null,
  descripcion text,
  archivo_path text,
  archivo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proyecto_bpmn
add column if not exists proceso_id bigint references public.procesos(id) on delete set null;

create table if not exists public.proceso_hallazgos (
  id bigint generated always as identity primary key,
  proceso_id bigint not null references public.procesos(id) on delete cascade,
  titulo varchar(255) not null,
  descripcion text,
  impacto text,
  recomendacion text,
  prioridad varchar(30) not null default 'media',
  estado varchar(60) not null default 'abierto',
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proceso_pendientes (
  id bigint generated always as identity primary key,
  proceso_id bigint not null references public.procesos(id) on delete cascade,
  titulo varchar(255) not null,
  descripcion text,
  responsable varchar(255),
  fecha_limite date,
  estado varchar(60) not null default 'pendiente',
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.empresa_sessions enable row level security;
alter table public.proyectos enable row level security;
alter table public.proyecto_tareas enable row level security;
alter table public.procesos enable row level security;
alter table public.proyecto_bpmn enable row level security;
alter table public.proceso_hallazgos enable row level security;
alter table public.proceso_pendientes enable row level security;

create index if not exists empresa_sessions_empresa_id_idx on public.empresa_sessions(empresa_id);
create index if not exists empresa_sessions_expires_at_idx on public.empresa_sessions(expires_at);
create index if not exists proyectos_empresa_id_idx on public.proyectos(empresa_id);
create index if not exists proyecto_tareas_proyecto_id_idx on public.proyecto_tareas(proyecto_id);
create unique index if not exists proyecto_tareas_proyecto_id_id_git_uidx on public.proyecto_tareas(proyecto_id, id_git) where id_git is not null;
create index if not exists procesos_proyecto_id_idx on public.procesos(proyecto_id);
create unique index if not exists procesos_proyecto_id_slug_uidx on public.procesos(proyecto_id, slug) where slug is not null;
create index if not exists proyecto_bpmn_proyecto_id_idx on public.proyecto_bpmn(proyecto_id);
create index if not exists proyecto_bpmn_proceso_id_idx on public.proyecto_bpmn(proceso_id);
create index if not exists proceso_hallazgos_proceso_id_idx on public.proceso_hallazgos(proceso_id);
create index if not exists proceso_pendientes_proceso_id_idx on public.proceso_pendientes(proceso_id);

-- Required because login_empresa changed its return shape to include a session.
drop function if exists public.login_empresa(text, text);

create or replace function public.login_empresa(
  p_usuario text,
  p_password text
)
returns table (
  id bigint,
  empresa varchar,
  usuario varchar,
  session_token uuid,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_empresa record;
  v_session record;
begin
  delete from public.empresa_sessions where empresa_sessions.expires_at <= now();

  select e.id, e.empresa, e.usuario
  into v_empresa
  from public.empresas e
  where e.activo is true
    and (
      lower(e.usuario) = lower(trim(p_usuario))
      or lower(e.empresa) = lower(trim(p_usuario))
    )
    and e.password = extensions.crypt(p_password, e.password)
  limit 1;

  if not found then
    return;
  end if;

  insert into public.empresa_sessions (empresa_id)
  values (v_empresa.id)
  returning token, empresa_sessions.expires_at
  into v_session;

  return query
  select
    v_empresa.id::bigint,
    v_empresa.empresa::varchar,
    v_empresa.usuario::varchar,
    v_session.token::uuid,
    v_session.expires_at::timestamptz;
end;
$$;

create or replace function public.get_portal_empresa(p_session_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_empresa record;
  v_result jsonb;
begin
  delete from public.empresa_sessions where empresa_sessions.expires_at <= now();

  select e.id, e.empresa, e.usuario
  into v_empresa
  from public.empresa_sessions s
  join public.empresas e on e.id = s.empresa_id
  where s.token = p_session_token
    and s.expires_at > now()
    and e.activo is true
  limit 1;

  if not found then
    return null;
  end if;

  select jsonb_build_object(
    'empresa', jsonb_build_object(
      'id', v_empresa.id,
      'empresa', v_empresa.empresa,
      'usuario', v_empresa.usuario
    ),
    'proyectos', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'nombre', p.nombre,
          'descripcion', p.descripcion,
          'estado', p.estado,
          'fecha_inicio', p.fecha_inicio,
          'fecha_fin', p.fecha_fin,
          'updated_at', p.updated_at,
          'tareas', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', t.id,
                'id_git', t.id_git,
                'fase', t.fase,
                'titulo', t.titulo,
                'descripcion', t.descripcion,
                'estado', t.estado,
                'responsable', t.responsable,
                'fecha_inicio', t.fecha_inicio,
                'fecha_fin', t.fecha_fin,
                'progreso', t.progreso,
                'peso', t.peso,
                'orden', t.orden,
                'dependencias', t.dependencias
              )
              order by t.orden, t.fecha_inicio nulls last, t.id
            )
            from public.proyecto_tareas t
            where t.proyecto_id = p.id
          ), '[]'::jsonb),
          'procesos', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', pr.id,
                'slug', pr.slug,
                'nombre', pr.nombre,
                'area', pr.area,
                'estado', pr.estado,
                'responsable_methodical', pr.responsable_methodical,
                'responsable_cliente', pr.responsable_cliente,
                'descripcion', pr.descripcion,
                'orden', pr.orden,
                'updated_at', pr.updated_at,
                'bpmn', coalesce((
                  select jsonb_agg(
                    jsonb_build_object(
                      'id', b.id,
                      'nombre', b.nombre,
                      'descripcion', b.descripcion,
                      'archivo_path', b.archivo_path,
                      'archivo_url', b.archivo_url,
                      'proceso_id', b.proceso_id,
                      'updated_at', b.updated_at
                    )
                    order by b.updated_at desc, b.id
                  )
                  from public.proyecto_bpmn b
                  where b.proceso_id = pr.id
                ), '[]'::jsonb),
                'hallazgos', coalesce((
                  select jsonb_agg(
                    jsonb_build_object(
                      'id', h.id,
                      'titulo', h.titulo,
                      'descripcion', h.descripcion,
                      'impacto', h.impacto,
                      'recomendacion', h.recomendacion,
                      'prioridad', h.prioridad,
                      'estado', h.estado,
                      'orden', h.orden
                    )
                    order by h.orden, h.id
                  )
                  from public.proceso_hallazgos h
                  where h.proceso_id = pr.id
                ), '[]'::jsonb),
                'pendientes', coalesce((
                  select jsonb_agg(
                    jsonb_build_object(
                      'id', pe.id,
                      'titulo', pe.titulo,
                      'descripcion', pe.descripcion,
                      'responsable', pe.responsable,
                      'fecha_limite', pe.fecha_limite,
                      'estado', pe.estado,
                      'orden', pe.orden
                    )
                    order by pe.orden, pe.fecha_limite nulls last, pe.id
                  )
                  from public.proceso_pendientes pe
                  where pe.proceso_id = pr.id
                ), '[]'::jsonb)
              )
              order by pr.orden, pr.nombre, pr.id
            )
            from public.procesos pr
            where pr.proyecto_id = p.id
          ), '[]'::jsonb),
          'bpmn', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', b.id,
                'nombre', b.nombre,
                'descripcion', b.descripcion,
                'archivo_path', b.archivo_path,
                'archivo_url', b.archivo_url,
                'proceso_id', b.proceso_id,
                'updated_at', b.updated_at
              )
              order by b.updated_at desc, b.id
            )
            from public.proyecto_bpmn b
            where b.proyecto_id = p.id
          ), '[]'::jsonb)
        )
        order by p.fecha_inicio nulls last, p.id
      )
      from public.proyectos p
      where p.empresa_id = v_empresa.id
    ), '[]'::jsonb)
  )
  into v_result;

  return v_result;
end;
$$;

create or replace function public.logout_empresa(p_session_token uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.empresa_sessions where token = p_session_token;
$$;

revoke all on function public.login_empresa(text, text) from public;
revoke all on function public.get_portal_empresa(uuid) from public;
revoke all on function public.logout_empresa(uuid) from public;

grant execute on function public.login_empresa(text, text) to anon, authenticated;
grant execute on function public.get_portal_empresa(uuid) to anon, authenticated;
grant execute on function public.logout_empresa(uuid) to anon, authenticated;

-- Future inserts with a hashed password:
-- insert into public.empresas (empresa, usuario, password)
-- values ('Empresa Demo', 'usuario demo', extensions.crypt('clave-segura', extensions.gen_salt('bf')));

-- Fix one existing company if it was inserted with a plaintext password after
-- running this setup:
-- update public.empresas
-- set password = extensions.crypt('clave-real', extensions.gen_salt('bf'))
-- where lower(usuario) = lower('usuario demo');

-- Minimal project seed example after creating an empresa:
-- insert into public.proyectos (empresa_id, nombre, descripcion, estado, fecha_inicio, fecha_fin)
-- select id, 'Implementación portal', 'Seguimiento inicial del proyecto.', 'en_desarrollo', current_date, current_date + 45
-- from public.empresas
-- where lower(empresa) = lower('Empresa Demo');
