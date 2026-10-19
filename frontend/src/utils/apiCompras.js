import { pedir } from './pedir.js'

// Pedidos de las compras. Todos llevan el token del usuario (rol USER).
// Pagar no manda nada: el back compra el carrito abierto, que tiene que estar en la pantalla de pago (EN_PAGO).
export const pagarCarrito = (token) => pedir('POST', '/compras', token)

export const obtenerCompra = (token, id) => pedir('GET', `/compras/${id}`, token)

// Todas las compras del usuario, de la más nueva a la más vieja. El listado viene paginado: no se descarta ninguna página.
export const obtenerMisCompras = (token, pagina = 0) =>
  pedir('GET', `/compras?page=${pagina}&size=100`, token).then((datos) =>
    pagina + 1 >= datos.totalPages
      ? datos.content
      : obtenerMisCompras(token, pagina + 1).then((resto) => [...datos.content, ...resto]))
