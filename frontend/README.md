# Zenoir — Frontend

Frontend de la ticketera de la fiesta **Zenoir** (Recoleta, Palacio Balcarce).
El **catálogo y el detalle de eventos están conectados al backend**. Login, carrito, checkout, tickets y administración conservan sus maquetas anteriores.


## Cómo correrlo

Requiere **Node 20.19 o superior** (lo pide Vite 8).

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

Otros comandos: `npm run build` (compila a `dist/`), `npm run lint` (oxlint), `npm run preview`.


Ver [guía de catálogo y detalle](GUIA_CATALOGO.md) para el contrato de integración y las pruebas manuales.

## Conexión con el backend

Iniciá el backend siguiendo el README de la raíz del repositorio. El catálogo usa el proxy `/api` de Vite, cuyo destino predeterminado es `http://127.0.0.1:8080`.

Para usar otro destino, copiá `.env.example` a `.env.local`, ajustá `ZENOIR_API_TARGET` y reiniciá Vite. `.env.local` queda fuera de Git. En un despliegue estático, configurá un proxy equivalente o `VITE_API_URL` con el CORS correspondiente.

Pruebas del frontend, desde esta carpeta:

```bash
node --test tests/*.test.mjs
```

Las pruebas usan fixtures y respuestas simuladas; no requieren una base de datos ni modifican stock.

## Cómo navegar (login falso)

No hay autenticación real. El formulario de `/login` (y el de `/registro`) crea un usuario en el estado de `App.jsx`:

| Email que ingresás | Rol | Qué ve |
| --- | --- | --- |
| `admin@zenoir.com` (cualquier contraseña) | `ADMIN` | Link "Gestionar eventos", sin carrito |
| cualquier otro | `USER` | Eventos, carrito, "Mis entradas" |
| (sin ingresar) | visitante | Landing y detalle de evento; para comprar pide ingresar |

Como la sesión vive solo en memoria (`useState`), **al recargar la página (F5) o escribir una URL a mano se pierde**. Navegá con los links.

Recorrido del módulo conectado: Inicio → buscar/filtrar eventos → detalle → elegir entradas. La compra queda pendiente de conectar con el carrito real. Las rutas Carrito → Pago → Mis entradas siguen siendo demostrativas. Como admin: Gestionar eventos → Editar / Nuevo evento.

### Rutas

| Ruta | Vista |
| --- | --- |
| `/` | `Inicio` (landing) |
| `/eventos/:id` | `EventoDetalle` (evento + elegir entradas) |
| `/carrito`, `/pago` | `Carrito`, `Pago` (solo USER) |
| `/mis-entradas` | `MisEntradas` (solo USER) |
| `/verificar/:codigo` | `VerificarEntrada` (la abre el QR de una entrada; solo ADMIN) |
| `/login`, `/registro` | `Login`, `Registro` |
| `/admin`, `/admin/nuevo`, `/admin/:id` | `GestionarEventos`, `NuevoEvento`, `EditarEvento` (solo ADMIN) |
| `/admin/categorias` | `GestionarCategorias` (crear, renombrar, activar o desactivar y eliminar; solo ADMIN) |
| `*` | `Aviso` ("Esta página no existe") |

## Estructura

```
src/
  main.jsx        BrowserRouter + App
  App.jsx         Estado (usuario, carrito) y rutas
  views/          Una por pantalla/ruta
  components/     Piezas chicas, una responsabilidad cada una
  data/           Datos de mentira (arrays) con los nombres de campo del backend
  utils/          Funciones puras (formatos, fechas, cuentas del carrito)
  styles/         CSS separado por tema (variables, botones, navbar, etc.)
  assets/         Fotos y flyers
    sponsors/     Logos de auspiciantes en SVG (blancos, para fondo negro)
```

Los componentes separan consulta, presentación, filtros y selección. Las consultas están en `utils/`, las pantallas en `views/` y la presentación en `components/`.

## Decisiones de diseño

- **`App.jsx` es el controlador (GRASP Controller):** guarda `usuario` y `carrito` y los reparte por props. No se usa Context.
- **Vistas vs. componentes:** las vistas arman la pantalla y manejan su estado; los componentes solo muestran lo que reciben (props).
- **Strategy con objetos "tabla":** en vez de `if/else` en cadena se busca la variante en un objeto. Ejemplos: `ACCIONES` por `estadoVenta` en `FilaEntrada`, `FILTROS` en `GestionarEventos`, links por rol en `data/navegacion.js`, `variante` en `Boton`.
- **Funciones puras en `utils/` (Information Expert / Pure Fabrication):** `utils/carrito.js` concentra las cuentas del carrito sin tocar React.
- **Composición con `children`:** `LayoutAcceso` envuelve Login y Registro.
- **Un solo formulario para crear y editar:** `FormularioEvento` (DRY).
- **Datos con la forma del backend:** `eventos.js`, `ofertas.js`, etc. usan los mismos nombres que los `ResponseDTO` (`estadoVenta`, `precioFinal`, etc.), para que al conectar cambie lo mínimo.

## Auspiciantes ("Nos acompañan")

`components/Sponsors.jsx` muestra los logos en una cinta que se desplaza sola (pausa al pasar el mouse), con el mismo truco que `Cinta` y `CintaFotos`: dos grupos iguales y una animación hasta `-50%`.

- Los 10 logos (Merle, UADE, Spirito Blu, BlackRock, Fernet Branca, Liga Profesional de Fútbol, Sernova, NUM, Voltra y Speed Unlimited) están en `src/assets/sponsors/` como SVG. Se vectorizaron a partir de las imágenes originales y se unificaron en blanco para que contrasten con el fondo negro. Lilac no tiene logo, así que no está.
- Los logos de varios colores (AFA/LPF) quedan en una sola tinta: lo que era cian, dorado o azul se dibuja en blanco y lo claro queda transparente. En Speed Unlimited el rayo rojo se dibuja en blanco atenuado (`fill-opacity` dentro del SVG) para que el texto blanco no se pierda encima.
- Para agregar uno: poner el SVG en `assets/sponsors/`, sumarlo en `data/sponsors.js` y darle su altura en `inicio.css` (`.sponsors__logo--su-id`), porque cada logo tiene otra proporción.

## Verificación de entradas (QR)

Cada entrada de "Mis entradas" y de "Compra confirmada" tiene un QR real (`components/CodigoQR.jsx`, con la librería `qrcode.react`). El QR guarda un link a `/verificar/<codigoQr>`. El código es el UUID al azar que genera el back al comprar, uno por entrada.

- El organizador escanea el QR con la cámara del celular y se abre `views/VerificarEntrada.jsx`. Solo el rol ADMIN puede verificar: un visitante ve "Ingresá como organizador" y, después del login, vuelve a la misma verificación; un usuario común ve "Solo el organizador puede verificar entradas".
- Al abrir el link se consulta la entrada **sin gastarla** (`GET /tickets/qr/{codigo}`). Si es válida: ✅ "Entrada válida" con a quién pertenece, el evento, la fecha, el lugar y el tipo. El ingreso se registra con el botón "Registrar ingreso" (`POST /tickets/qr/{codigo}/utilizar`).
- Si el código no existe: ❌ "Entrada no válida". Si ya se usó: ❌ "Entrada ya utilizada", con el día y la hora en que se usó. Si está cancelada: ❌ "Entrada cancelada".
- Se registra con un botón y no al abrir el link porque abrir una página no debería cambiar datos (igual que un GET en el back): así una vista previa o un escaneo de prueba no queman la entrada. Además, en desarrollo React ejecuta los efectos dos veces (StrictMode): si el efecto gastara la entrada, el primer escaneo diría "ya utilizada".
- El estado de cada pantalla sale de una tabla (`RESULTADOS` en `utils/verificacion.js`), igual que `ACCIONES` en `FilaEntrada`.

**Escanear con el celular (demo).** El QR tiene que apuntar a una dirección que el celular pueda abrir. Con la PC y el celular en la misma red Wi-Fi:

1. Copiá `.env.example` a `.env.local` y poné en `VITE_URL_PUBLICA` la IP de la PC (por ejemplo `http://192.168.0.15:5173`; se ve con `ipconfig`).
2. Levantá el front con `npm run dev -- --host` para que Vite acepte conexiones de la red. Si el celular no abre la página, permití Node.js en el firewall de Windows.
3. En el celular, ingresá con la cuenta ADMIN la primera vez (la sesión queda guardada) y escaneá los QR con la cámara.

Sin configurar nada, el QR apunta a `http://localhost:5173`: sirve para probar desde la misma PC abriendo el link.

## Qué es de mentira

- Login/registro, contraseñas y roles.
- Los arrays de eventos y ofertas de `src/data/` se conservan para las maquetas de administración y carrito. El catálogo y el detalle consultan la API. "Mis entradas" muestra siempre 3 entradas de ejemplo.
- Los botones de admin (guardar, crear, eliminar, subir flyer) no persisten nada.
- El reloj de reserva (15 min) es solo visual y arranca al agregar al carrito.
- El catálogo y el detalle tienen ajustes para escritorio y celular; otros módulos conservan sus estilos anteriores.

## Cómo conectarlo después

1. El catálogo ya tiene funciones Fetch en `src/utils/apiEventos.js` y las usa desde las vistas con `useEffect`. Los otros módulos pueden conectar sus propias consultas.
2. Los módulos restantes deben reemplazar sus imports de `src/data/...` por datos reales y contemplar carga, vacío y error.
3. Reemplazar `ingresar` en `App.jsx` por el `POST` de login y decidir dónde guardar el JWT (el token solo trae el email; no hay `/me`).
4. El backend hoy **no tiene CORS**: el catálogo usa el proxy `/api` de Vite. `ZENOIR_API_TARGET` permite elegir la API local; sin configuración usa 8080. Para producción hace falta un proxy equivalente o configurar CORS en el servidor.
5. Carrito real: `/carritos/activo/...`, con `iniciar-pago` y los relojes de armado y de pago.

## Cosas nuevas (no vistas en clase)

Para poder explicarlas si preguntan:

- **`useParams`** (react-router-dom): lee `:id` de la URL. Se usa en `EventoDetalle` y `EditarEvento`.
- **Optional chaining `?.`**: `usuario?.rol` no falla si `usuario` es `null`.
- **Nombres de propiedad calculados** `[evento.target.name]: ...`: un solo `onChange` para todos los campos de un formulario.
- **`setInterval` / `clearInterval` dentro de `useEffect`** con función de limpieza: el reloj de `Reloj.jsx`.
- **`Date` / `Date.now()`, `padStart`, `toLocaleString('es-AR')`, `encodeURIComponent`**: fechas, formatos y precios en `utils/`.
- **Métodos de array**: `find`, `filter`, `forEach`, `slice`, y spread `[...items]` (`map` ya se vio).
- **Importar imágenes como módulos** (Vite): `import foto from '../assets/foto.jpg'`.
- **Fragmentos `<>...</>`**: agrupar elementos sin agregar un `div`.
- **`<a href="#id">`**: scroll interno de la landing sin usar `document`.
- **Inputs `type="date"` y `type="datetime-local"`**: selectores nativos del navegador.
- **CSS moderno** (sin librerías): variables CSS, `@keyframes`, `aspect-ratio`, `mask-image`, `background-clip: text` (texto dorado), `backdrop-filter`, `position: sticky`, `mix-blend-mode`, `@media (prefers-reduced-motion)`, y un filtro SVG (`feTurbulence`) para el grano.
- **SVG como imagen**: se importan como cualquier imagen (`import logo from '../assets/sponsors/merle.svg'`) y se usan con `<img>`.
- **`animation-play-state: paused`** y **`filter: drop-shadow()`**: la cinta de auspiciantes se pausa al pasar el mouse y el logo recibe un brillo dorado.
- **Google Fonts** por `<link>` en `index.html` (Inter Tight, Barlow Condensed, Montserrat).
- **Vite**: `npm run dev` / `build` como herramienta de desarrollo.
- **`qrcode.react`** (librería): `<QRCodeSVG value="..." />` dibuja como SVG el QR de un texto. Se usa solo en `CodigoQR.jsx`.
- **Variables de entorno de Vite** (`import.meta.env.VITE_URL_PUBLICA`): las que empiezan con `VITE_` llegan al navegador. Se configuran en `.env.local` (ver `.env.example`). Ya se usaba `VITE_API_URL` en `apiEventos.js`.
- **`state` en un link** (`<Link state>` y `useLocation().state`): el aviso de la verificación le dice al login a dónde volver.
- **Lista de definiciones `<dl>` / `<dt>` / `<dd>`** (HTML): pares "etiqueta: valor" en el resultado de la verificación.
- **`<datalist>`** (HTML): sugerencias nativas para un `<input>` (`list="id"`). En el formulario del evento, "Lugar" y "Categoría" sugieren los que ya existen y, si se escribe uno nuevo, se crea al guardar (`utils/guardarEvento.js`).

Dependencias agregadas a lo que trae la plantilla de Vite: `react-router-dom` y `qrcode.react` (QR de las entradas).
