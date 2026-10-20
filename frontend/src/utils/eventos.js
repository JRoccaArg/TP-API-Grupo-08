import { fechaApi } from './fechas.js'

// El backend devuelve precioFinal: no recalculamos sus descuentos ni inventamos estadoVenta.
const estado = (valor) => (valor || '').toUpperCase()
const tienePrecio = (oferta) => Number.isFinite(oferta.precioFinal) && oferta.precioFinal >= 0

// El back pasa el evento a FINALIZADO con un pequeño retraso; mientras tanto, si ya llegó su fecha de fin, se muestra como finalizado.
const eventoTerminado = (evento, ahora) => Boolean(evento.fechaHoraFin) && ahora >= fechaApi(evento.fechaHoraFin).getTime()

// ¿Se puede mostrar el detalle? No si el id no es válido, si todavía carga, si falló, o si el evento es un borrador.
export const detalleDisponible = ({ idValido, cargando, error, evento }) =>
  idValido && !cargando && !error && evento?.estado?.toUpperCase() !== 'BORRADOR'

export function estadoOferta(oferta, evento, ahora = Date.now()) {
  const estadoEvento = eventoTerminado(evento, ahora) && estado(evento.estado) === 'ACTIVO' ? 'FINALIZADO' : estado(evento.estado)
  if (estadoEvento !== 'ACTIVO') {
    return ['FINALIZADO', 'CANCELADO', 'REPROGRAMADO'].includes(estadoEvento) ? estadoEvento : 'PAUSADO'
  }
  if (estado(oferta.estado) === 'FINALIZADO') return 'FINALIZADO'
  if (estado(oferta.estado) === 'PAUSADO') return 'PAUSADO'
  if (estado(oferta.estado) === 'AGOTADO' || oferta.cantidadDisponible === 0) return 'AGOTADO'
  if (oferta.fechaFinVenta && ahora > fechaApi(oferta.fechaFinVenta).getTime()) return 'FINALIZADO'
  if (oferta.fechaInicioVenta && ahora < fechaApi(oferta.fechaInicioVenta).getTime()) return 'PROXIMAMENTE'
  if (estado(oferta.estado) !== 'ACTIVO' || !Number.isInteger(oferta.cantidadDisponible) ||
      oferta.cantidadDisponible < 0 || !tienePrecio(oferta)) return 'PAUSADO'
  return 'EN_VENTA'
}

export function resumenEntradas(evento, ahora = Date.now()) {
  const ofertas = evento.ofertas || []
  const estados = ofertas.map((oferta) => estadoOferta(oferta, evento, ahora))
  const enVenta = ofertas.filter((oferta, indice) => estados[indice] === 'EN_VENTA')
  let situacion = 'SIN_ENTRADAS'
  if (eventoTerminado(evento, ahora) && estado(evento.estado) === 'ACTIVO') situacion = 'FINALIZADO'
  else if (estado(evento.estado) !== 'ACTIVO') situacion = estado(evento.estado)
  else if (evento.errorOfertas) situacion = 'ERROR'
  else if (enVenta.length) situacion = 'EN_VENTA'
  else if (estados.includes('PROXIMAMENTE')) situacion = 'PROXIMAMENTE'
  else if (estados.includes('PAUSADO')) situacion = 'PAUSADO'
  else if (estados.includes('AGOTADO')) situacion = 'AGOTADO'
  else if (estados.length) situacion = 'VENTA_FINALIZADA'
  return {
    precioDesde: enVenta.length ? Math.min(...enVenta.map((oferta) => oferta.precioFinal)) : null,
    estado: situacion,
    disponibles: enVenta.reduce((total, oferta) => total + oferta.cantidadDisponible, 0),
  }
}

export function ajustarSeleccion(seleccion, ofertas, evento, ahora = Date.now()) {
  return seleccion.map((item) => {
    const oferta = ofertas.find((actual) => actual.id === item.ofertaId)
    const cantidad = oferta && estadoOferta(oferta, evento, ahora) === 'EN_VENTA'
      ? Math.min(Math.max(0, Number.isFinite(item.cantidad) ? Math.floor(item.cantidad) : 0), oferta.cantidadDisponible) : 0
    return { ofertaId: item.ofertaId, cantidad }
  }).filter((item) => item.cantidad > 0)
}

export function totalSeleccion(seleccion, ofertas) {
  // Operar en centavos evita acumular errores de coma flotante.
  return seleccion.reduce((total, item) => {
    const oferta = ofertas.find((actual) => actual.id === item.ofertaId)
    return total + Math.round((oferta?.precioFinal || 0) * 100) * item.cantidad
  }, 0) / 100
}

// El evento con las entradas elegidas ya descontadas del stock: es lo que queda después de apartarlas en el carrito.
export const descontarStock = (evento, seleccion) => ({
  ...evento,
  ofertas: evento.ofertas.map((oferta) => ({
    ...oferta,
    cantidadDisponible: oferta.cantidadDisponible - (seleccion.find((item) => item.ofertaId === oferta.id)?.cantidad ?? 0),
  })),
})
