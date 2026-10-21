import { ahoraParaInput, fechaApi, paraInput } from './fechas.js'

// Valor del desplegable de tipos que abre el alta de un tipo nuevo (no es un id real).
export const TIPO_NUEVO = 'nuevo'

export const ofertaVacia = {
  tipoEntradaId: '', precio: '', descuento: '0', cantidad: '', estado: 'ACTIVO',
}

export const ofertaAFormulario = (oferta) => ({
  tipoEntradaId: String(oferta.tipoEntradaId),
  precio: String(oferta.precio),
  descuento: String(oferta.porcentajeDescuento ?? 0),
  cantidad: String(oferta.cantidadTotal),
  estado: oferta.estado,
})

export const vendidas = (oferta) => oferta.cantidadTotal - oferta.cantidadDisponible

// Un evento terminado, finalizado o cancelado no acepta entradas nuevas (el back también lo rechaza).
export const admiteEntradas = (evento, ahora = Date.now()) =>
  !['FINALIZADO', 'CANCELADO'].includes(evento.estado) &&
  !(evento.fechaHoraFin && ahora >= fechaApi(evento.fechaHoraFin).getTime())

// Las fechas de venta no se cargan a mano: una entrada se vende desde que se crea hasta que termina el evento,
// y el admin la habilita o la frena con su estado (activa o pausada). El back las sigue pidiendo, así que se mandan estas.
export const ventaDelEvento = (evento, ahora = Date.now()) => ({
  fechaInicioVenta: `${ahoraParaInput(ahora)}:00`,
  fechaFinVenta: `${paraInput(evento.fechaHoraFin)}:00`,
})

export function validarOferta(datos, { edicion = false, vendidas: yaVendidas = 0 } = {}) {
  if (!edicion && (!datos.tipoEntradaId || datos.tipoEntradaId === TIPO_NUEVO)) return 'Elegí el tipo de entrada.'
  if (datos.precio.trim() === '' || !(Number(datos.precio) > 0)) return 'El precio tiene que ser mayor a 0.'
  const descuento = Number(datos.descuento.trim() === '' ? 0 : datos.descuento)
  if (!(descuento >= 0 && descuento <= 100)) return 'El descuento tiene que estar entre 0 y 100.'
  const cantidad = Number(datos.cantidad)
  if (datos.cantidad.trim() === '' || !Number.isInteger(cantidad) || cantidad <= 0) {
    return 'La cantidad tiene que ser un número entero mayor a 0.'
  }
  if (cantidad < yaVendidas) return `Ya se vendieron ${yaVendidas}: la cantidad no puede ser menor.`
  return ''
}
