import { fechaApi } from './fechas.js'

// Ayudas sobre las compras que devuelve el back: { id, total, estado, detalles: [{ eventoId, tipoEntradaNombre, tickets }] }.
// Una "entrada" es un ticket con lo necesario para mostrarlo: { id, eventoId, eventoTitulo, tipo, estado, codigoQr }.
export const entradasDeCompra = (compra) =>
  compra.detalles.flatMap((detalle) =>
    detalle.tickets.map((ticket) => ({
      id: ticket.id,
      eventoId: detalle.eventoId,
      eventoTitulo: detalle.eventoTitulo,
      tipo: detalle.tipoEntradaNombre,
      estado: ticket.estado,
      codigoQr: ticket.codigoQr,
    })))

export const entradasDeCompras = (compras) => compras.flatMap(entradasDeCompra)

export const idsDeEventosDeCompras = (compras) => [...new Set(compras.flatMap((compra) => compra.detalles.map((detalle) => detalle.eventoId)))]

// Agrupa las entradas por evento: [{ id, titulo, evento, entradas }]. Primero los eventos que todavía no terminaron
// (del más próximo al más lejano) y después los que ya pasaron (del más reciente al más viejo).
export function agruparPorEvento(entradas, eventos, ahora = Date.now()) {
  const grupos = []
  entradas.forEach((entrada) => {
    let grupo = grupos.find((otro) => otro.id === entrada.eventoId)
    if (!grupo) {
      grupo = { id: entrada.eventoId, titulo: entrada.eventoTitulo, evento: eventos[entrada.eventoId], entradas: [] }
      grupos.push(grupo)
    }
    grupo.entradas.push(entrada)
  })
  const inicio = (grupo) => (grupo.evento?.fechaHoraInicio ? fechaApi(grupo.evento.fechaHoraInicio).getTime() : Infinity)
  const termino = (grupo) => Boolean(grupo.evento?.fechaHoraFin) && fechaApi(grupo.evento.fechaHoraFin).getTime() < ahora
  return grupos.sort((a, b) => {
    if (termino(a) !== termino(b)) return termino(a) ? 1 : -1
    return termino(a) ? inicio(b) - inicio(a) : inicio(a) - inicio(b)
  })
}
