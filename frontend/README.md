# Zenoir — Frontend

Frontend de la ticketera de la fiesta **Zenoir** (Recoleta, Palacio Balcarce).
Es una versión **visual y de navegación**: todavía **no está conectada al backend**. Todo lo que se ve sale de arrays en `src/data/`.

## Cómo correrlo

Requiere **Node 20.19 o superior** (lo pide Vite 8).

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

Otros comandos: `npm run build` (compila a `dist/`), `npm run lint` (oxlint), `npm run preview`.

## Cómo navegar (login falso)

No hay autenticación real. El formulario de `/login` (y el de `/registro`) crea un usuario en el estado de `App.jsx`:

| Email que ingresás | Rol | Qué ve |
| --- | --- | --- |
| `admin@zenoir.com` (cualquier contraseña) | `ADMIN` | Link "Gestionar eventos", sin carrito |
| cualquier otro | `USER` | Eventos, carrito, "Mis entradas" |
| (sin ingresar) | visitante | Landing y detalle de evento; para comprar pide ingresar |

Como la sesión vive solo en memoria (`useState`), **al recargar la página (F5) o escribir una URL a mano se pierde**. Navegá con los links.

Recorrido sugerido: Inicio → Evento → elegir entradas → Carrito → Pago → Mis entradas. Como admin: Gestionar eventos → Editar / Nuevo evento.

### Rutas

| Ruta | Vista |
| --- | --- |
| `/` | `Inicio` (landing) |
| `/eventos/:id` | `EventoDetalle` (evento + elegir entradas) |
| `/carrito`, `/pago` | `Carrito`, `Pago` (solo USER) |
| `/mis-entradas` | `MisEntradas` (solo USER) |
| `/login`, `/registro` | `Login`, `Registro` |
| `/admin`, `/admin/nuevo`, `/admin/:id` | `GestionarEventos`, `NuevoEvento`, `EditarEvento` (solo ADMIN) |
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

Ningún archivo JS pasa de ~80 líneas (el más largo tiene 62).

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

## Qué es de mentira

- Login/registro, contraseñas y roles.
- Eventos, ofertas y entradas compradas (`src/data/`). "Mis entradas" muestra siempre 3 entradas de ejemplo.
- El QR es un dibujo, no un código real.
- Los botones de admin (guardar, crear, eliminar, subir flyer) no persisten nada.
- El reloj de reserva (15 min) es solo visual y arranca al agregar al carrito.
- Responsive: hay un ajuste básico bajo 1100 px; el diseño está pensado para escritorio.

## Cómo conectarlo después

1. Crear funciones de fetch en `src/utils/` (por ejemplo `api.js`) y llamarlas desde las vistas con `useEffect`.
2. Reemplazar cada import de `src/data/...` por el estado que se llena con la respuesta. Agregar estados de carga, vacío y error.
3. Reemplazar `ingresar` en `App.jsx` por el `POST` de login y decidir dónde guardar el JWT (el token solo trae el email; no hay `/me`).
4. El backend hoy **no tiene CORS**: habilitarlo o usar el proxy de Vite.
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

Única dependencia agregada a lo que trae la plantilla de Vite: `react-router-dom`.
