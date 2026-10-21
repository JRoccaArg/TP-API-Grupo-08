import { pedir } from './pedir.js'

// Pedidos de las compras. Todos llevan el token del usuario (rol USER).
// Pagar no manda nada: el back compra el carrito abierto, que tiene que estar en la pantalla de pago (EN_PAGO).
export const pagarCarrito = (token) => pedir('POST', '/compras', token)

// Pide el reembolso de las entradas de UN evento de una compra y devuelve la compra como quedó. El back solo lo permite si ese evento se canceló
// o reprogramó. La compra pasa a CANCELADA cuando no le queda ninguna entrada vigente (en la web siempre se muestra como reembolso).
export const reembolsarEvento = (token, compraId, eventoId) =>
  pedir('POST', `/compras/${compraId}/eventos/${eventoId}/reembolsar`, token)

export const obtenerCompra = (token, id) => pedir('GET', `/compras/${id}`, token)

// Todas las compras del usuario, de la más nueva a la más vieja. El listado viene paginado: no se descarta ninguna página.
export const obtenerMisCompras = (token, pagina = 0) =>
  pedir('GET', `/compras?page=${pagina}&size=100`, token).then((datos) =>
    pagina + 1 >= datos.totalPages
      ? datos.content
      : obtenerMisCompras(token, pagina + 1).then((resto) => [...datos.content, ...resto]))
