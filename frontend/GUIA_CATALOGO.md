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

## Filtros y paginación en el servidor

`GET /eventos` conserva la respuesta Page de Spring: `content`, `number`, `size`, `totalElements` y `totalPages`. Los parámetros opcionales son:

| Parámetro | Comportamiento |
| --- | --- |
| `page`, `size` | Página desde cero y tamaño. Se envían ambos o ninguno; el tamaño máximo es 100. |
| `nombre` | Coincidencia parcial por título, sin distinguir mayúsculas ni tildes habituales en español. |
| `categoriaId` | ID obtenido desde `GET /categories`. |
| `precioMin`, `precioMax` | Límites inclusivos y no negativos sobre el precio final de una misma oferta actualmente en venta. |
| `catalogo=true` | Excluye borradores y ordena los eventos activos primero, luego por ID. Sin este parámetro se conservan los estados del listado general. |
| `proximo=true` | Filtra eventos activos futuros y ordena por fecha para consultar la próxima fecha de portada. |

El Service valida el rango y normaliza la búsqueda; el Repository filtra antes de paginar. La consulta de precio respeta el descuento y su redondeo, el stock, el estado y las fechas de venta. Las ofertas no duplican eventos en los resultados.

React solicita seis eventos por página y completa únicamente las ofertas e imágenes de esa página. Los filtros y la página se conservan en la URL; al cambiar un filtro se vuelve a la primera página. Las categorías se consultan por separado y la portada obtiene la próxima fecha global con una consulta de tamaño uno. En escritorio hay seis tarjetas por fila, en tablet dos y en celular una.

### Pruebas en Insomnia o un cliente HTTP

Creá solicitudes GET sobre la URL del backend configurado, usando los IDs y precios de esa base:

1. `/eventos`: devuelve Page y conserva el listado general.
2. `/eventos?page=0&size=6&catalogo=true`: devuelve hasta seis eventos públicos y sus totales.
3. Repetí con `page=1`: cambia la página sin repetir los eventos de la anterior, si hay suficientes registros.
4. Agregá por separado `nombre`, `categoriaId`, `precioMin` o `precioMax`, y luego combinalos: los totales corresponden al conjunto filtrado antes de paginar.
5. Usá un nombre inexistente: devuelve `content=[]` y total cero.
6. Pedí una página fuera de rango: devuelve una página vacía y mantiene el total real.
7. Enviá un mínimo mayor que el máximo o un precio negativo: responde 400.
8. Enviá sólo `page` sin `size`: responde 400.

En el navegador comprobá los mismos filtros, avanzar y retroceder, abrir el detalle y volver, además de los estados de carga, vacío y error. En Network, la consulta del catálogo debe enviar `size=6`; no debe recorrer todas las páginas para filtrar. En desarrollo, StrictMode puede iniciar y cancelar solicitudes adicionales.

### Comprobar los campos de precio

En el navegador se aceptan centavos con coma o punto, sin separadores de miles
(`8500,50` o `8500.50`). React envía el punto decimal que espera la API. Un campo
vacío deja ese extremo sin límite; `0` es un límite válido y no equivale a vacío.
Los importes inválidos permanecen visibles con un mensaje y no se consulta el
catálogo hasta corregirlos. No se borran ni se interpretan como ausencia de filtro.

Los dos límites se aplican a la misma oferta actualmente en venta. Un evento puede
tener otras entradas más baratas o más caras: con un rango activo, la tarjeta muestra
el menor precio que cumple ese rango y lo identifica como `DESDE · EN TU RANGO`.
Sin filtro de precio, muestra el menor precio general como antes. Abrir el detalle
conserva todas las ofertas del evento.

Para repetir las comprobaciones con el [seed del repositorio](../zenoirprod/database/seed/README.md),
mientras sus ofertas sigan vigentes, limpiá los filtros antes de cada caso:

| Mínimo | Máximo | Resultado esperado |
| --- | --- | --- |
| vacío | vacío | 20 eventos públicos, seis por página. |
| 18000 | vacío | Cuatro eventos; Tango muestra $42.499,99, la entrada que cumple el mínimo. |
| vacío | 30000 | Diez eventos; al avanzar se muestran 7–10 y se conserva el máximo. |
| 8500 | 8500 | Noche de Jazz en el Palacio, $8.500. |
| 42499,99 | 42499.99 | Tango y Medianoche, $42.499,99. |
| 0 | 0 | Dos eventos con entradas gratuitas. |
| 9000 | 8000 | Mensaje de rango invertido, sin mostrar resultados anteriores. |
| -1 | vacío | Mensaje de precio negativo y el valor sigue visible para corregirlo. |
| texto | vacío | Mensaje de importe inválido, sin quitar el filtro silenciosamente. |

Combiná además nombre `Noche`, categoría `Música` y rango 8000–9000: queda Jazz.
Después de avanzar de página, cambiar un límite vuelve a la primera página.
`Limpiar filtros` vacía ambos precios, el nombre y la categoría y restaura el catálogo.
En Insomnia, los parámetros numéricos usan punto decimal; por ejemplo:

```text
GET /eventos?page=0&size=6&catalogo=true&precioMin=42499.99&precioMax=42499.99
```

## Zona horaria del catálogo

Los eventos y ventanas de venta almacenados como `LocalDateTime` representan horarios de
`America/Argentina/Buenos_Aires`. Las respuestas de evento y oferta incluyen offset ISO
(por ejemplo `2026-10-18T12:00-03:00`). Las solicitudes de alta/edición siguen enviando
horario local sin offset. React compara instantes y muestra horarios de Buenos Aires,
independientemente de la zona del navegador. La portada reintenta en un minuto si
el reloj del cliente ya considera pasada la próxima fecha; no consulta en bucle.
