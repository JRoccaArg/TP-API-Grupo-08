# Zenoir: frontend

La web de Zenoir hecha con React, Vite y JavaScript. Habla con el back (`zenoirprod`) por la API REST.

## Cómo correrlo

Hace falta Node 20.19 o más y el back levantado (ver el README de la raíz).

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`. Las llamadas a `/api` las reenvía Vite al back, que por defecto está en `http://127.0.0.1:8080`. Para usar otro destino se copia `.env.example` a `.env.local` y se cambia `ZENOIR_API_TARGET`.

Otros comandos: `npm run build`, `npm run lint` y `npm test`.

## Pantallas

| Ruta | Pantalla |
| --- | --- |
| `/` | Inicio y catálogo con filtros |
| `/eventos/:id` | Detalle del evento y elección de entradas |
| `/carrito`, `/pago`, `/compra/:id` | Carrito, pago y compra confirmada (compradores) |
| `/mis-entradas` | Entradas compradas, con su QR y el reembolso si el evento se canceló |
| `/login`, `/registro` | Ingresar y crear cuenta |
| `/verificar/:codigo` | Resultado de escanear un QR (administrador) |
| `/admin` | Eventos: lista, alta, edición, resumen y escáner de QR (administrador) |
| `/admin/locaciones`, `/admin/categorias`, `/admin/tipos-entrada` | Los otros datos que carga el administrador |

## Carpetas

```
src/
  views/        una por pantalla
  components/   piezas chicas que se reutilizan
  utils/        llamadas a la API y funciones de ayuda
  styles/       CSS separado por tema
  data/         textos y listas fijas
  assets/       imágenes y logos
```

`App.jsx` guarda la sesión y `Sitio.jsx` el carrito; los reparten por props.

## Cosas para saber

- La sesión se guarda en `localStorage` y vence junto con el token (24 horas).
- Para escanear los QR con un celular, el QR tiene que apuntar a la IP de la PC: se pone en `VITE_URL_PUBLICA` (`.env.local`) y se levanta con `npm run dev -- --host`.
- Librerías agregadas a lo que trae Vite: `react-router-dom`, `qrcode.react` (dibuja el QR) y `@yudiel/react-qr-scanner` (lee el QR con la cámara).
