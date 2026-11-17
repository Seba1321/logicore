# Vitrinas

Páginas sin login para mostrarle a un cliente (o prospecto) avances de software,
demos, sitios web en diseño, videos y capturas. Se abren en `methodical.cl/ver/<token>`.

No dependen del portal: no necesitan empresa ni usuario en Supabase.

## Crear una vitrina

1. Copia `vitrinas/_template` a `vitrinas/<slug>` (el slug es interno, no aparece en el enlace).
2. Edita `vitrina.json`.
3. Commit + push a `main`: el Action `Sync Clientes To Supabase` la publica.
4. Obtén el enlace en el SQL editor (el token no se guarda en Git ni sale en los logs):

   ```sql
   select slug, 'https://methodical.cl/ver/' || token as enlace from public.vitrinas;
   ```

El token se genera una sola vez y sobrevive a cada sync, así que el enlace no cambia.

## Campos

- `cliente`, `titulo`, `mensaje`: encabezado de la página.
- `activo`: `false` apaga el enlace sin borrar nada.
- `items[]`:
  - `tipo`: `web` | `demo` | `video` | `imagen` | `documento`.
  - `grupo`: opcional, agrupa tarjetas bajo un título (en el orden en que aparecen).
  - `estado`: opcional, `en_diseno` | `en_desarrollo` | `en_revision` | `listo`.
  - `url`: enlace externo (sitio, demo, YouTube/Vimeo/Loom, PDF…), **o** `archivo_path`
    para subir un archivo local (imagen, mp4, pdf) a Storage.
  - `captura_path` / `captura_url`: miniatura de la tarjeta (recomendado 16:9).
  - `embeber`: `false` si el sitio no se deja mostrar en iframe (muchas apps con login
    lo bloquean); entonces solo se ofrece "Abrir en pestaña nueva".
  - `nota`: texto destacado, p. ej. credenciales de un usuario demo.
  - `fecha`: `YYYY-MM-DD`, se muestra en la tarjeta.

## Rotar o apagar un enlace

```sql
-- nuevo enlace (el anterior deja de funcionar)
update public.vitrinas
set token = translate(encode(extensions.gen_random_bytes(12), 'base64'), '+/=', '-_')
where slug = '<slug>';
```

Para apagarla, `"activo": false` en el JSON y push.

## Ojo: el repo es público

Todo lo que se commitea en `vitrinas/` (JSON y capturas) queda visible en GitHub,
y los archivos subidos van a un bucket público. Lo único privado es el token.
Para material sensible, aloja el demo/diseño fuera del repo y referencia solo la `url`.
