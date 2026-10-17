# Catálogo y detalle de eventos

## Responsabilidades

El backend mantiene las capas Controller → Service → Repository. React conserva las pantallas en `views/`, los componentes en `components/`, las consultas Fetch en `utils/` y los estilos en `styles/`.

El catálogo y el detalle consultan eventos, ofertas e imágenes mediante GET públicos. Los datos de otros módulos conservan su implementación existente. El DTO de evento no incluye precios, stock ni imágenes; esos datos se obtienen desde sus endpoints asociados.

## Ejecución

Desde la raíz del repositorio, iniciá el backend con el perfil y las variables de conexión indicados en el README general. En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrí la URL informada por Vite y la sección `#fechas`. El proxy `/api` usa por defecto el backend en `http://127.0.0.1:8080`. Para otro destino, copiá `.env.example` a `.env.local`, ajustá `ZENOIR_API_TARGET` y reiniciá Vite. No se versionan credenciales ni archivos de configuración particulares de una máquina.

## Detalle y selección de entradas

El detalle obtiene el evento por ID, sus ofertas y los metadatos de imágenes; el contenido de cada imagen se sirve desde su endpoint `/archivo`. Se prioriza la portada y se conserva la galería completa. Cuando falta una imagen, se muestra un respaldo identificado como referencia.

Los precios finales provienen del backend. La selección usa cantidades enteras limitadas por el stock y respeta el estado del evento y la ventana de venta. Seleccionar una cantidad no reserva entradas.

`EventoDetalle` ofrece el callback opcional `onConfirmarSeleccion`, que recibe:

```js
{
  eventoId,
  items: [{ eventoTipoEntradaId, cantidad }]
}
```

Los IDs se obtienen de la API; `eventoTipoEntradaId` identifica la oferta del evento. Antes de confirmar se reconsultan precios y disponibilidad. El callback devuelve una promesa que resuelve cuando el carrito real acepta la operación o rechaza con un mensaje mostrable. Hasta conectar ese callback, el botón de compra permanece deshabilitado. La autenticación, reserva efectiva y compra corresponden a sus módulos.

## Verificación automatizada

Desde `frontend/`:

```bash
npm run build
npm run lint
node --test tests/*.test.mjs
```

Las pruebas usan datos controlados y Fetch simulado; no requieren una base particular. Verifican errores de red, cancelación de consultas, galerías, ofertas no vendibles, límites de stock y cálculos en centavos.

## Verificación manual

Usá los eventos disponibles en la base configurada, sin asumir nombres, IDs, categorías ni cantidades fijas. Probá búsqueda con y sin tildes, categoría, precios, combinaciones sin resultados y rango invertido. Abrí un detalle y comprobá las imágenes, precios y cantidades. Volvé al catálogo y verificá que se conserve la búsqueda.
