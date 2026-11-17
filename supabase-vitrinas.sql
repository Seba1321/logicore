-- Vitrinas: páginas públicas sin login para mostrar avances, demos y diseños.
-- Se abren en /ver/<token>. El token es el único "secreto": quien tenga el
-- enlace ve la vitrina. Lo genera la base y no vive en Git (el repo es público).
-- Ejecutar en el SQL editor de Supabase antes del primer sync de vitrinas.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.vitrinas (
  id bigint generated always as identity primary key,
  slug varchar(120) not null unique,
  token varchar(64) not null unique
    default translate(encode(extensions.gen_random_bytes(12), 'base64'), '+/=', '-_'),
  cliente varchar(255),
  titulo varchar(255) not null,
  mensaje text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vitrina_items (
  id bigint generated always as identity primary key,
  vitrina_id bigint not null references public.vitrinas(id) on delete cascade,
  grupo varchar(120),
  tipo varchar(20) not null default 'web'
    check (tipo in ('web', 'demo', 'video', 'imagen', 'documento')),
  titulo varchar(255) not null,
  descripcion text,
  estado varchar(30)
    check (estado is null or estado in ('en_diseno', 'en_desarrollo', 'en_revision', 'listo')),
  url text,
  captura_url text,
  embeber boolean not null default true,
  nota text,
  fecha date,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.vitrinas enable row level security;
alter table public.vitrina_items enable row level security;

create index if not exists vitrina_items_vitrina_id_idx on public.vitrina_items(vitrina_id);

create or replace function public.get_vitrina(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'cliente', v.cliente,
    'titulo', v.titulo,
    'mensaje', v.mensaje,
    'updated_at', v.updated_at,
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', i.id,
          'grupo', i.grupo,
          'tipo', i.tipo,
          'titulo', i.titulo,
          'descripcion', i.descripcion,
          'estado', i.estado,
          'url', i.url,
          'captura_url', i.captura_url,
          'embeber', i.embeber,
          'nota', i.nota,
          'fecha', i.fecha
        )
        order by i.orden, i.id
      )
      from public.vitrina_items i
      where i.vitrina_id = v.id
    ), '[]'::jsonb)
  )
  from public.vitrinas v
  where v.token = p_token
    and v.activo is true
  limit 1;
$$;

revoke all on function public.get_vitrina(text) from public;
grant execute on function public.get_vitrina(text) to anon, authenticated;
