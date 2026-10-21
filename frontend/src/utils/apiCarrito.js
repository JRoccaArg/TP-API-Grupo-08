import { pedir } from './pedir.js'

// Todos devuelven el carrito completo y actualizado, con eso se actualiza la pantalla. "token" es el del usuario (solo el rol USER tiene carrito)
export const obtenerCarrito = (token) => pedir('GET', '/carritos/activo', token)

export const agregarItem = (token, eventoTipoEntradaId, cantidad) =>
  pedir('POST', '/carritos/activo/items', token, { eventoTipoEntradaId, cantidad })

// La cantidad es la nueva cantidad total del item (no lo que se suma) y tiene que ser mayor a 0: para sacarlo, quitarItem.
export const cambiarCantidad = (token, itemId, cantidad) =>
  pedir('PATCH', `/carritos/activo/items/${itemId}`, token, { cantidad })

export const quitarItem = (token, itemId) => pedir('DELETE', `/carritos/activo/items/${itemId}`, token)
export const vaciarCarrito = (token) => pedir('POST', '/carritos/activo/vaciar', token)

export const iniciarPago = (token) => pedir('POST', '/carritos/activo/iniciar-pago', token)

// El back agrega de a una entrada por vez: se piden en fila y, por cada una que entra, se avisa con alAgregar(carrito).
// Si una falla, las anteriores ya quedaron en el carrito.
export function agregarVarios(token, items, alAgregar) {
  if (!items.length) return Promise.resolve()
  const [item, ...resto] = items
  return agregarItem(token, item.eventoTipoEntradaId, item.cantidad).then((carrito) => {
    alAgregar(carrito)
    return agregarVarios(token, resto, alAgregar)
  })
}
