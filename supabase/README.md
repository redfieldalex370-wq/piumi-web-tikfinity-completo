# Supabase

Ejecuta `schema.sql` completo desde SQL Editor. El archivo sirve tanto para instalaciones nuevas como para actualizar la versión anterior.

Después confirma que existen los buckets públicos:

- `artworks`
- `site-assets`

No crees políticas públicas para `commissions`, `live_events` o `live_users`. La aplicación accede mediante rutas de servidor con `SUPABASE_SERVICE_ROLE_KEY`.
