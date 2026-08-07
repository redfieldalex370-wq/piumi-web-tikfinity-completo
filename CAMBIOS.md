# Cambios incluidos

## Sitio público
- Inicio con presentación, redes, horario de stream y sección Quiénes somos.
- Página Stream con estadísticas, rankings y actividad reciente.
- Galería con filtros mediante etiquetas.
- Comisiones con precios, formulario, fila pública y seguimiento privado.

## Administración
- Dashboard general.
- Estado y configuración pública de TikFinity.
- Galería administrable con imágenes y etiquetas.
- Kanban editable de comisiones con notas internas y públicas.
- Precios conectados a la página pública.
- Términos versionados.
- Configuración de portada, horario y redes.

## TikFinity y Supabase
- Puente local `scripts/tikfinity-bridge.mjs`.
- Recepción de chat, regalos, likes, follows, shares, usuarios de sala y suscripciones.
- Agrupación de likes y control de rachas de regalos.
- Ingesta firmada hacia Next.js.
- Registro de sesiones, usuarios, eventos crudos y estadísticas diarias.
- Esquema unificado en `supabase/schema.sql`.

## Seguridad
- El ZIP no contiene `.env.local`, claves privadas, `.next` ni `node_modules`.
- Usa `.env.example` para crear tu configuración local.
