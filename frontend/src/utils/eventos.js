// El backend devuelve precioFinal: no recalculamos sus descuentos ni inventamos estadoVenta.
const estado = (valor) => (valor || '').toUpperCase()
const tienePrecio = (oferta) => Number.isFinite(oferta.precioFinal) && oferta.precioFinal >= 0
const normalizar = (texto) => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function estadoOferta(oferta, evento, ahora = Date.now()) {
  const estadoEvento = estado(evento.estado)
  if (estadoEvento !== 'ACTIVO') {
    return ['FINALIZADO', 'CANCELADO', 'REPROGRAMADO'].includes(estadoEvento) ? estadoEvento : 'PAUSADO'
  }
  if (estado(oferta.estado) === 'FINALIZADO') return 'FINALIZADO'
  if (estado(oferta.estado) === 'PAUSADO') return 'PAUSADO'
  if (estado(oferta.estado) === 'AGOTADO' || oferta.cantidadDisponible === 0) return 'AGOTADO'
  if (oferta.fechaFinVenta && ahora > new Date(oferta.fechaFinVenta).getTime()) return 'FINALIZADO'
  if (oferta.fechaInicioVenta && ahora < new Date(oferta.fechaInicioVenta).getTime()) return 'PROXIMAMENTE'
  if (estado(oferta.estado) !== 'ACTIVO' || !Number.isInteger(oferta.cantidadDisponible) ||
      oferta.cantidadDisponible < 0 || !tienePrecio(oferta)) return 'PAUSADO'
  return 'EN_VENTA'
}

export function resumenEntradas(evento, ahora = Date.now()) {
  const ofertas = evento.ofertas || []
  const estados = ofertas.map((oferta) => estadoOferta(oferta, evento, ahora))
  const enVenta = ofertas.filter((oferta, indice) => estados[indice] === 'EN_VENTA')
  let situacion = 'SIN_ENTRADAS'
  if (estado(evento.estado) !== 'ACTIVO') situacion = estado(evento.estado)
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

export function filtrarEventos(eventos, { busqueda = '', categoria = '', precioMin = '', precioMax = '' }, ahora = Date.now()) {
  const minimo = precioMin === '' ? 0 : Number(precioMin)
  const maximo = precioMax === '' ? Infinity : Number(precioMax)
  if (!Number.isFinite(minimo) || minimo < 0 || Number.isNaN(maximo) || maximo < minimo) return []
  return eventos.filter((evento) => {
    if (!normalizar(evento.titulo).includes(normalizar(busqueda.trim()))) return false
    if (categoria && String(evento.categoriaId) !== String(categoria)) return false
    if (precioMin === '' && precioMax === '') return true
    // Una misma oferta debe cumplir ambos extremos; incluye otras entradas además de la más barata.
    return !evento.errorOfertas && evento.ofertas.some((oferta) =>
      estadoOferta(oferta, evento, ahora) === 'EN_VENTA' &&
      oferta.precioFinal >= minimo && oferta.precioFinal <= maximo)
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
