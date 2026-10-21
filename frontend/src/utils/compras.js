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

const estadoDe = (evento) => String(evento?.estado).toUpperCase()
export const eventoCancelado = (evento) => estadoDe(evento) === 'CANCELADO'
export const eventoReprogramado = (evento) => estadoDe(evento) === 'REPROGRAMADO'
export const eventoAfectado = (evento) => eventoCancelado(evento) || eventoReprogramado(evento)

// Los estados del evento en los que el back deja reembolsar una compra (en el back, "cancelarla").
const ESTADOS_CON_REEMBOLSO = ['CANCELADO', 'REPROGRAMADO']
export const permiteReembolso = (evento) => ESTADOS_CON_REEMBOLSO.includes(estadoDe(evento))

export const cantidadDeEntradas = (compra) => compra.detalles.reduce((total, detalle) => total + detalle.tickets.length, 0)

export const comprasDelEvento = (compras, eventoId) =>
  compras.filter((compra) => compra.detalles.some((detalle) => detalle.eventoId === eventoId))

// Cómo están las entradas de un evento dentro de una compra: cuántas siguen emitidas (se pueden reembolsar), cuántas ya se
// reembolsaron, cuántas se usaron (esas no se reembolsan nunca) y los importes (precio unitario de cada una).
export function resumenDelEvento(compra, eventoId) {
  const resumen = { total: 0, emitidas: 0, reembolsadas: 0, usadas: 0, montoEmitidas: 0, montoReembolsadas: 0 }
  compra.detalles.filter((detalle) => detalle.eventoId === eventoId).forEach((detalle) => {
    detalle.tickets.forEach((ticket) => {
      resumen.total += 1
      if (ticket.estado === 'UTILIZADO') resumen.usadas += 1
      else if (ticket.estado === 'CANCELADO') { resumen.reembolsadas += 1; resumen.montoReembolsadas += Number(detalle.precioUnitario) }
      else { resumen.emitidas += 1; resumen.montoEmitidas += Number(detalle.precioUnitario) }
    })
  })
  return resumen
}

export const sePuedeReembolsar = (compra, evento) => permiteReembolso(evento) && resumenDelEvento(compra, evento.id).emitidas > 0

export const reemplazarCompra = (compras, nueva) => compras.map((compra) => (compra.id === nueva.id ? nueva : compra))

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
