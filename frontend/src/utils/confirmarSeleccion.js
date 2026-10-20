import { verificarSeleccion } from './apiEventos.js'
import { descontarStock } from './eventos.js'

// Al confirmar se vuelven a consultar la disponibilidad y los precios; recién ahí se entrega la selección al carrito.
// Termina con { cambio: true, evento, seleccion } si algo cambió (no se agrega nada) o con { cambio: false, evento, seleccion: [] }:
// el evento ya sin el stock que quedó apartado, sin volver a pedirlo. Si falla el agregado, el error trae en "actual" lo
// que se verificó (para mostrar los datos al día) y, en "agregados", cuántas entradas ya entraron al carrito.
export function confirmarSeleccion(evento, seleccion, agregarAlCarrito) {
  return verificarSeleccion(evento, seleccion).then((verificado) => {
    if (verificado.cambio) return verificado
    const items = verificado.seleccion.map((item) => ({ eventoTipoEntradaId: item.ofertaId, cantidad: item.cantidad }))
    return Promise.resolve(agregarAlCarrito({ eventoId: verificado.evento.id, items }))
      .then(() => ({ cambio: false, evento: descontarStock(verificado.evento, verificado.seleccion), seleccion: [] }))
      .catch((fallo) => {
        fallo.actual = verificado
        throw fallo
      })
  })
}
