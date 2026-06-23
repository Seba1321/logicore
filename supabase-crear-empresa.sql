-- ============================================================================
--  CREAR UNA NUEVA EMPRESA EN EL PORTAL DE CLIENTES
-- ============================================================================
--
--  ¿Qué hace este archivo?
--  Da de alta una empresa para que pueda entrar al portal en /portal.
--  Es el ÚNICO paso manual: el resto de los datos (proyectos, Gantt, procesos,
--  hallazgos, pendientes y BPMN) se cargan solos desde Git con el sync.
--
--  ¿Cómo lo uso?
--    1. Abre el editor SQL de Supabase (Dashboard -> SQL Editor).
--    2. Pega este archivo completo.
--    3. Edita SOLO los 3 valores del bloque "DATOS DE LA EMPRESA" de abajo.
--    4. Presiona "Run".
--    5. Listo: revisa el resultado al final (debe aparecer la empresa, activa).
--
--  Importante:
--    - La contraseña se guarda CIFRADA (bcrypt). Nunca queda en texto plano.
--    - El nombre de "empresa" debe coincidir EXACTO con el campo "empresa" del
--      archivo clientes/<cliente>/project.json, porque el sync busca la empresa
--      por ese nombre para asociarle el proyecto.
--    - "empresa" y "usuario" son únicos: no pueden repetirse entre clientes.
--    - Si corres este script otra vez con el mismo "usuario", NO se duplica:
--      se actualiza el nombre y se RESETEA la contraseña (útil para recuperarla).
--    - Si el "usuario" es nuevo pero el nombre de "empresa" ya existe (con otro
--      usuario), Postgres devolverá un error de valor duplicado. Es a propósito:
--      evita registrar dos veces la misma empresa. Usa un nombre distinto o, si
--      quieres editar la empresa existente, usa las "AYUDAS OPCIONALES" del final.
--
-- ============================================================================


-- ----------------------------------------------------------------------------
--  DATOS DE LA EMPRESA  ->  edita estos 3 valores y nada más
-- ----------------------------------------------------------------------------
with datos as (
  select
    'Empresa Demo'      as empresa,    -- Nombre visible. Debe calzar con project.json
    'empresa-demo'      as usuario,    -- Usuario para iniciar sesión
    'cambia-esta-clave' as password    -- Contraseña inicial que le entregas al cliente
)

-- ----------------------------------------------------------------------------
--  No hace falta tocar nada debajo de esta línea.
-- ----------------------------------------------------------------------------
insert into public.empresas (empresa, usuario, password, activo)
select
  empresa,
  usuario,
  extensions.crypt(password, extensions.gen_salt('bf')),  -- cifrado bcrypt
  true
from datos
on conflict (usuario) do update
  set empresa  = excluded.empresa,
      password = excluded.password,
      activo   = true
returning id, empresa, usuario, activo, created_at;
--  ^ El resultado muestra la empresa creada/actualizada (sin exponer la clave).


-- ============================================================================
--  AYUDAS OPCIONALES  (descoméntalas solo si las necesitas)
-- ============================================================================

-- Ver todas las empresas registradas (nunca muestra la contraseña):
-- select id, empresa, usuario, activo, created_at
-- from public.empresas
-- order by created_at desc;

-- Cambiar / resetear la contraseña de una empresa existente:
-- update public.empresas
-- set password = extensions.crypt('nueva-clave', extensions.gen_salt('bf'))
-- where lower(usuario) = lower('empresa-demo');

-- Desactivar el acceso de una empresa (sin borrar sus datos):
-- update public.empresas set activo = false
-- where lower(usuario) = lower('empresa-demo');

-- Reactivar el acceso:
-- update public.empresas set activo = true
-- where lower(usuario) = lower('empresa-demo');

-- Eliminar una empresa por completo (borra también sus proyectos por cascada):
-- delete from public.empresas
-- where lower(usuario) = lower('empresa-demo');
