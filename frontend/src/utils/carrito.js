// Operaciones sobre el carrito. Son funciones puras: reciben datos y devuelven datos nuevos.
// Un item es { ofertaId, cantidad }. El carrito es { items, vencimiento }.
import { eventos } from '../data/eventos.js'
import { ofertas } from '../data/ofertas.js'

const QUINCE_MINUTOS = 15 * 60 * 1000

export const carritoVacio = { items: [], vencimiento: null }

// --- sobre una lista de items (sirve para la selección y para el carrito) ---
export const cantidadDe = (items, ofertaId) => {
  const item = items.find((i) => i.ofertaId === ofertaId)
  return item ? item.cantidad : 0
}

export const fijarCantidad = (items, ofertaId, cantidad) => {
  if (cantidad <= 0) return items.filter((i) => i.ofertaId !== ofertaId)
  if (!items.find((i) => i.ofertaId === ofertaId)) return [...items, { ofertaId, cantidad }]
  return items.map((i) => (i.ofertaId === ofertaId ? { ...i, cantidad } : i))
}

export const cantidadItems = (items) => {
  let total = 0
  items.forEach((item) => {
    total += item.cantidad
  })
  return total
}

// Une cada item con su oferta y su evento, y calcula el subtotal.
export const detalleCarrito = (items) =>
  items.map((item) => {
    const oferta = ofertas.find((o) => o.id === item.ofertaId)
    const evento = eventos.find((e) => e.id === oferta.eventoId)
    return { ...item, oferta, evento, subtotal: oferta.precioFinal * item.cantidad }
  })

export const totalDetalle = (lineas) => {
  let total = 0
  lineas.forEach((linea) => {
    total += linea.subtotal
  })
  return total
}

// --- sobre el carrito completo ---
export const agregarAlCarrito = (carrito, nuevos) => {
  let items = carrito.items
  nuevos.forEach((nuevo) => {
    items = fijarCantidad(items, nuevo.ofertaId, cantidadDe(items, nuevo.ofertaId) + nuevo.cantidad)
  })
  return { items, vencimiento: carrito.vencimiento || Date.now() + QUINCE_MINUTOS }
}

export const fijarEnCarrito = (carrito, ofertaId, cantidad) => {
  const items = fijarCantidad(carrito.items, ofertaId, cantidad)
  return { items, vencimiento: items.length > 0 ? carrito.vencimiento : null }
}
