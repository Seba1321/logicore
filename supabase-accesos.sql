-- Registro de accesos al portal de empresas (login exitoso y fallido).
--
-- Este archivo es el DELTA listo para pegar en el SQL editor de Supabase.
-- Los mismos cambios ya están incorporados en supabase-empresas-login.sql,
-- que sigue siendo la verdad versionada: si tocas uno, toca el otro.
--
-- Es idempotente: se puede correr varias veces sin romper nada.

-- 1. Tabla de auditoría --------------------------------------------------------
-- empresa_id queda en null si el intento fue fallido o si la empresa se borra;
-- empresa_nombre guarda el nombre desnormalizado para que el histórico sobreviva.
create table if not exists public.empresa_accesos (
  id bigint generated always as identity primary key,
  empresa_id bigint references public.empresas(id) on delete set null,
  empresa_nombre varchar(255),
  usuario_intentado varchar(255) not null,
  exito boolean not null,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Sin policies: nadie llega por anon/authenticated. Solo service-role y SQL editor.
alter table public.empresa_accesos enable row level security;

create index if not exists empresa_accesos_created_at_idx on public.empresa_accesos(created_at desc);
create index if not exists empresa_accesos_empresa_id_idx on public.empresa_accesos(empresa_id);
create index if not exists empresa_accesos_fallidos_idx on public.empresa_accesos(created_at desc) where exito is false;

-- 2. Helper que escribe el registro -------------------------------------------
-- Nunca lanza: un fallo de auditoría no puede bloquear un login legítimo.
-- No es callable desde el frontend (sin grant a anon/authenticated); solo la
-- llama login_empresa, que es security definer.
create or replace function public.registrar_acceso_empresa(
  p_empresa_id bigint,
  p_empresa_nombre text,
  p_usuario text,
  p_exito boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_headers jsonb;
  v_ip_text text;
  v_ip inet;
begin
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
  exception when others then
    v_headers := null;
  end;

  v_ip_text := nullif(btrim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), '');

  begin
    v_ip := v_ip_text::inet;
  exception when others then
    v_ip := null;
  end;

  begin
    insert into public.empresa_accesos (
      empresa_id, empresa_nombre, usuario_intentado, exito, ip, user_agent
    )
    values (
      p_empresa_id,
      left(p_empresa_nombre, 255),
      left(coalesce(btrim(p_usuario), ''), 255),
      p_exito,
      v_ip,
      nullif(left(coalesce(v_headers ->> 'user-agent', ''), 500), '')
    );
  exception when others then
    null;
  end;
end;
$$;

revoke all on function public.registrar_acceso_empresa(bigint, text, text, boolean) from public;

-- 3. login_empresa con auditoría ----------------------------------------------
-- Idéntica a la versión anterior salvo los dos perform de registro.
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
    perform public.registrar_acceso_empresa(null, null, p_usuario, false);
    return;
  end if;

  insert into public.empresa_sessions (empresa_id)
  values (v_empresa.id)
  returning token, empresa_sessions.expires_at
  into v_session;

  perform public.registrar_acceso_empresa(v_empresa.id, v_empresa.empresa, p_usuario, true);

  return query
  select
    v_empresa.id::bigint,
    v_empresa.empresa::varchar,
    v_empresa.usuario::varchar,
    v_session.token::uuid,
    v_session.expires_at::timestamptz;
end;
$$;

revoke all on function public.login_empresa(text, text) from public;
grant execute on function public.login_empresa(text, text) to anon, authenticated;

-- Consultas útiles -------------------------------------------------------------
--
-- Últimos 50 accesos:
-- select created_at, coalesce(empresa_nombre, '—') as empresa, usuario_intentado, exito, ip
-- from public.empresa_accesos
-- order by created_at desc
-- limit 50;
--
-- Último acceso exitoso por empresa:
-- select e.empresa, max(a.created_at) as ultimo_acceso, count(*) as entradas
-- from public.empresa_accesos a
-- join public.empresas e on e.id = a.empresa_id
-- where a.exito
-- group by e.empresa
-- order by ultimo_acceso desc;
--
-- Intentos fallidos de los últimos 7 días:
-- select created_at, usuario_intentado, ip
-- from public.empresa_accesos
-- where exito is false and created_at > now() - interval '7 days'
-- order by created_at desc;
--
-- Retención opcional (correr a mano o con pg_cron):
-- delete from public.empresa_accesos where created_at < now() - interval '12 months';
