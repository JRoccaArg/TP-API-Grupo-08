import { fechaApi } from './fechas.js'

// El backend devuelve precioFinal: no recalculamos sus descuentos ni inventamos estadoVenta.
const estado = (valor) => (valor || '').toUpperCase()
const tienePrecio = (oferta) => Number.isFinite(oferta.precioFinal) && oferta.precioFinal >= 0
const normalizar = (texto) => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// El back pasa el evento a FINALIZADO con un pequeño retraso; mientras tanto, si ya llegó su fecha de fin, se muestra como finalizado.
const eventoTerminado = (evento, ahora) => Boolean(evento.fechaHoraFin) && ahora >= fechaApi(evento.fechaHoraFin).getTime()

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

// Los campos conservan lo escrito; sólo normalizamos al comparar o consultar la API.
export const normalizarImporteFiltro = (valor) => String(valor ?? '').trim().replace(',', '.')

export function validarRangoPrecios(precioMin = '', precioMax = '') {
  const importes = [precioMin, precioMax].map(normalizarImporteFiltro)
  if (importes.some((valor) => valor.startsWith('-'))) return 'Los precios no pueden ser negativos.'
  if (importes.some((valor) => valor !== '' &&
    (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(valor) || !Number.isFinite(Number(valor))))) {
    return 'Ingresá precios válidos, con hasta dos decimales y sin separadores de miles.'
  }
  if (importes.every((valor) => valor !== '') && Number(importes[0]) > Number(importes[1])) {
    return 'El mínimo no puede superar al máximo.'
  }
  return ''
}

// El precio mostrado debe pertenecer a la misma oferta que cumple los dos límites.
export function precioDesdeEnRango(evento, { precioMin = '', precioMax = '' } = {}, ahora = Date.now()) {
  if (evento.errorOfertas || validarRangoPrecios(precioMin, precioMax)) return null
  const minimo = normalizarImporteFiltro(precioMin) === '' ? 0 : Number(normalizarImporteFiltro(precioMin))
  const maximo = normalizarImporteFiltro(precioMax) === '' ? Infinity : Number(normalizarImporteFiltro(precioMax))
  const precios = (evento.ofertas || []).filter((oferta) =>
    estadoOferta(oferta, evento, ahora) === 'EN_VENTA' &&
    oferta.precioFinal >= minimo && oferta.precioFinal <= maximo).map((oferta) => oferta.precioFinal)
  return precios.length ? Math.min(...precios) : null
}

export function filtrarEventos(eventos, { busqueda = '', categoria = '', precioMin = '', precioMax = '' }, ahora = Date.now()) {
  if (validarRangoPrecios(precioMin, precioMax)) return []
  return eventos.filter((evento) => {
    if (!normalizar(evento.titulo).includes(normalizar(busqueda.trim()))) return false
    if (categoria && String(evento.categoriaId) !== String(categoria)) return false
    if (precioMin === '' && precioMax === '') return true
    return precioDesdeEnRango(evento, { precioMin, precioMax }, ahora) !== null
  })
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

export function leerFiltrosCatalogo(parametros) {
  const precioMin = parametros.get('min') || ''
  const precioMax = parametros.get('max') || ''
  const pedida = Number(parametros.get('pagina'))
  return {
    busqueda: parametros.get('q') || '', categoria: parametros.get('categoria') || '', precioMin, precioMax,
    // "lejanos" (por defecto): la fecha más futura primero. "antiguos": la más antigua primero.
    orden: parametros.get('orden') === 'antiguos' ? 'antiguos' : 'lejanos',
    pagina: Number.isSafeInteger(pedida) && pedida > 0 ? pedida : 1,
    errorPrecio: validarRangoPrecios(precioMin, precioMax),
  }
}

// La parte "?..." de la URL con los parámetros cambiados. Un valor vacío quita el parámetro.
export function conParametros(search, cambios) {
  const nuevos = new URLSearchParams(search)
  Object.entries(cambios).forEach(([clave, valor]) => {
    if (valor === '') nuevos.delete(clave)
    else nuevos.set(clave, valor)
  })
  return nuevos.toString()
}

// El evento con las entradas elegidas ya descontadas del stock: es lo que queda después de apartarlas en el carrito.
export const descontarStock = (evento, seleccion) => ({
  ...evento,
  ofertas: evento.ofertas.map((oferta) => ({
    ...oferta,
    cantidadDisponible: oferta.cantidadDisponible - (seleccion.find((item) => item.ofertaId === oferta.id)?.cantidad ?? 0),
  })),
})
