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
