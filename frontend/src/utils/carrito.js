import { fechaApi } from './fechas.js'

// Ayudas sobre el carrito que devuelve el back: { id, estado, fechaVencimiento, items, total }.
// Un item trae: id, eventoId, eventoTitulo, tipoEntradaNombre, cantidad, precioOriginal, porcentajeDescuento,
// precioUnitario y subtotal. estado: ACTIVO (armándolo) o EN_PAGO (ya entró a la pantalla de pago).
export const QUINCE_MINUTOS = 15 * 60 * 1000

// El carrito de quien no tiene uno (visitante, administrador) o todavía no se pidió al back.
export const carritoVacio = { id: null, estado: 'ACTIVO', fechaVencimiento: null, items: [], total: 0 }

export const cantidadItems = (carrito) => carrito.items.reduce((total, item) => total + item.cantidad, 0)

// Hasta cuándo están reservadas las entradas, en milisegundos (null si el carrito está vacío).
export const vencimientoMs = (carrito) => (carrito.fechaVencimiento ? fechaApi(carrito.fechaVencimiento).getTime() : null)

export const idsDeEventos = (carrito) => [...new Set(carrito.items.map((item) => item.eventoId))]
