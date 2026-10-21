import { estadoOferta } from './eventos.js'

// Los filtros del catálogo (nombre, categoría, precio, orden y página) viven en la URL; el back hace la búsqueda.
// Acá se leen y validan, y se calcula qué precio mostrar en una tarjeta cuando hay un rango de precios.
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

export function leerFiltrosCatalogo(parametros) {
  const precioMin = parametros.get('min') || ''
  const precioMax = parametros.get('max') || ''
  const pedida = Number(parametros.get('pagina'))
  return {
    busqueda: parametros.get('q') || '', categoria: parametros.get('categoria') || '', precioMin, precioMax,
    estadoEvento: ['todos', 'en-curso', 'finalizados', 'cancelados'].includes(parametros.get('estado')) ? parametros.get('estado') : 'proximos',
    orden: ['lejanos', 'menor-precio', 'mayor-precio'].includes(parametros.get('orden')) ? parametros.get('orden') : 'proximos',
    pagina: Number.isSafeInteger(pedida) && pedida > 0 ? pedida : 1,
    errorPrecio: validarRangoPrecios(precioMin, precioMax),
  }
}

export const hayFiltros = (filtros) =>
  Boolean(filtros.busqueda || filtros.categoria || filtros.precioMin !== '' || filtros.precioMax !== '' || (filtros.estadoEvento && filtros.estadoEvento !== 'proximos'))

// La parte "?..." de la URL con los parámetros cambiados. Un valor vacío quita el parámetro.
export function conParametros(search, cambios) {
  const nuevos = new URLSearchParams(search)
  Object.entries(cambios).forEach(([clave, valor]) => {
    if (valor === '') nuevos.delete(clave)
    else nuevos.set(clave, valor)
  })
  return nuevos.toString()
}
