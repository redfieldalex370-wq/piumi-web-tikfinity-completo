# Piumi Web

Sitio completo para la comunidad de Piumi con:

- Inicio editable: presentación, redes, horario y Quiénes somos.
- Stream: rankings de regalos y likes, estadísticas y actividad reciente.
- Galería filtrable por etiquetas.
- Comisiones: precios, formulario, fila pública y seguimiento privado.
- Administración: stream, galería, Kanban, precios, términos y configuración.
- Puente local para recibir eventos de TikFinity por WebSocket y guardarlos en Supabase.

## Requisitos

- Node.js 22 o superior.
- Un proyecto de Supabase.
- TikFinity instalado en la computadora donde se realiza el stream.
- Event API de TikFinity activa en `ws://localhost:21213/`.

## 1. Instalar

```bash
npm install
cp .env.example .env.local
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Completa `.env.local` con tus claves reales. Nunca compartas ese archivo.

## 2. Preparar Supabase

1. Abre Supabase Dashboard.
2. Entra a **SQL Editor**.
3. Copia y ejecuta completo `supabase/schema.sql`.

El script es idempotente y también agrega columnas faltantes de versiones anteriores. Crea:

- configuración y términos versionados;
- galería, etiquetas y precios;
- comisiones y notas de progreso;
- sesiones, usuarios, eventos y estadísticas LIVE;
- buckets públicos `artworks` y `site-assets`.

Toda lectura y escritura pasa por el servidor con `service_role`. No expongas esa clave en variables que comiencen con `NEXT_PUBLIC_`.

## 3. Ejecutar la web

```bash
npm run dev
```

Abre:

- Sitio: `http://localhost:3000`
- Panel: `http://localhost:3000/admin`
- Stream: `http://localhost:3000/stream`

## 4. Encender TikFinity

Con la web encendida, abre otra terminal:

```bash
npm run tikfinity
```

El puente hace lo siguiente:

1. Se conecta a `ws://localhost:21213/`.
2. Recibe `chat`, `gift`, `share`, `follow`, `like`, `roomUser` y `subscribe`.
3. Agrupa likes durante unos segundos.
4. Evita contar regalos de racha antes de `repeatEnd`.
5. Firma y envía los eventos a `/api/live/events/ingest`.
6. Guarda el evento original y actualiza estadísticas agregadas.
7. Mantiene un latido de estado visible en `/admin/stream`.

Las variables relevantes son:

```env
TIKFINITY_WS_URL=ws://localhost:21213/
PIUMI_EVENT_INGEST_URL=http://localhost:3000/api/live/events/ingest
PIUMI_EVENT_INGEST_SECRET=misma-clave-que-el-servidor
LIVE_EVENT_INGEST_SECRET=misma-clave-que-el-puente
TIKFINITY_BRIDGE_ID=piumi-main-pc
TIKFINITY_LIKE_FLUSH_MS=4000
```

## 5. Probar sin estar en directo

Con la web encendida, puedes enviar un evento de prueba desde PowerShell:

```powershell
$headers = @{
  Authorization = "Bearer TU_CLAVE_DE_INGESTA"
  "Content-Type" = "application/json"
}

$body = @{
  event = "gift"
  eventKey = "prueba-regalo-001"
  occurredAt = (Get-Date).ToString("o")
  bridgeId = "prueba-manual"
  data = @{
    userId = "demo-123"
    uniqueId = "piumigo_demo"
    nickname = "Piumigo Demo"
    giftName = "Rosa"
    giftId = "5655"
    repeatCount = 5
    repeatEnd = $true
    giftType = 1
    diamondCount = 1
  }
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Uri "http://localhost:3000/api/live/events/ingest" -Method Post -Headers $headers -Body $body
```

Usa un `eventKey` diferente para cada prueba. Los duplicados se ignoran intencionalmente.

## Rutas públicas

| Ruta | Función |
|---|---|
| `/` | Presentación, redes, horario, Quiénes somos y galería destacada |
| `/stream` | Estadísticas, mejor apoyo, más likes y actividad reciente |
| `/galeria` | Dibujos con filtros por etiquetas |
| `/comisiones` | Precios, Kanban público, formulario y términos |
| `/seguimiento` | Consulta privada mediante código `PIU-AÑO-XXXX` |
| `/terminos` | Versión publicada de términos y condiciones |

## Rutas administrativas

| Ruta | Función |
|---|---|
| `/admin` | Resumen general |
| `/admin/stream` | Estado TikFinity, métricas, eventos y visibilidad pública |
| `/admin/galeria` | Subir dibujos, etiquetas, visibilidad y destacados |
| `/admin/comisiones` | Kanban editable, clientes, dinero, notas y evidencia |
| `/admin/precios` | Servicios y precios usados por la página pública |
| `/admin/terminos` | Publicar términos con una versión nueva |
| `/admin/configuracion` | Portada, horario, textos y redes sociales |

## Privacidad

- La fila pública de comisiones nunca expone nombre, correo o contacto.
- El administrador puede ocultar cualquier comisión de la fila pública.
- Las notas internas no aparecen en el seguimiento del cliente.
- Los mensajes de chat se almacenan como eventos crudos, pero no se publican en la actividad visible.
- Antes de publicar rankings, informa a la comunidad que nombres de TikTok y actividad del LIVE pueden aparecer en la web.

## Comandos

```bash
npm run dev        # Desarrollo
npm run build      # Compilación de producción
npm run start      # Servidor de producción
npm run typecheck  # Verificación TypeScript
npm run lint       # ESLint
npm run tikfinity  # Puente local TikFinity → Supabase
```

## Despliegue

La web puede desplegarse en Vercel u otro proveedor compatible con Next.js. El puente TikFinity no se despliega en Vercel: debe ejecutarse en la computadora del stream porque `localhost:21213` pertenece a esa computadora.

En producción cambia:

```env
PIUMI_EVENT_INGEST_URL=https://tu-dominio.com/api/live/events/ingest
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

Conserva el mismo secreto largo en `LIVE_EVENT_INGEST_SECRET` del servidor y `PIUMI_EVENT_INGEST_SECRET` del puente.
