import { ahoraParaInput, fechaApi, paraInput } from './fechas.js'

// Valor del desplegable de tipos que abre el alta de un tipo nuevo (no es un id real).
export const TIPO_NUEVO = 'nuevo'

export const ofertaVacia = {
  tipoEntradaId: '', precio: '', descuento: '0', cantidad: '', inicio: '', fin: '', estado: 'ACTIVO',
}

// De una entrada que devolvió el back a los datos que maneja el formulario (todo texto, como los campos).
export const ofertaAFormulario = (oferta) => ({
  tipoEntradaId: String(oferta.tipoEntradaId),
  precio: String(oferta.precio),
  descuento: String(oferta.porcentajeDescuento ?? 0),
  cantidad: String(oferta.cantidadTotal),
  inicio: paraInput(oferta.fechaInicioVenta),
  fin: paraInput(oferta.fechaFinVenta),
  estado: oferta.estado,
})

export const vendidas = (oferta) => oferta.cantidadTotal - oferta.cantidadDisponible

// Un evento terminado, finalizado o cancelado no acepta entradas nuevas (el back también lo rechaza).
export const admiteEntradas = (evento, ahora = Date.now()) =>
  !['FINALIZADO', 'CANCELADO'].includes(evento.estado) &&
  !(evento.fechaHoraFin && ahora >= fechaApi(evento.fechaHoraFin).getTime())

// Las fechas que propone el botón del formulario: se vende desde ahora hasta que termina el evento.
export const ventaDelEvento = (evento, ahora = Date.now()) => ({
  inicio: ahoraParaInput(ahora),
  fin: paraInput(evento.fechaHoraFin),
})

// Devuelve el primer problema que encuentra, o '' si está todo bien. El back vuelve a validar.
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
  if (!datos.inicio || !datos.fin) return 'Elegí desde cuándo y hasta cuándo se vende.'
  if (datos.fin <= datos.inicio) return 'El fin de la venta tiene que ser posterior al inicio.'
  return ''
}
