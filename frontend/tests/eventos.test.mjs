import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ajustarSeleccion, estadoOferta, filtrarEventos, resumenEntradas, totalSeleccion,
  leerFiltrosCatalogo, normalizarImporteFiltro, precioDesdeEnRango, validarRangoPrecios,
} from '../src/utils/eventos.js'

const AHORA = new Date('2026-10-17T12:00:00Z').getTime()
const evento = (cambios = {}) => ({
  id: 1, titulo: 'Noche de Café', categoriaId: 5, estado: 'ACTIVO', ofertas: [], ...cambios,
})
const oferta = (cambios = {}) => ({
  id: 1, precio: 1000, porcentajeDescuento: 10, precioFinal: 900,
  cantidadDisponible: 150, estado: 'ACTIVO',
  fechaInicioVenta: '2026-10-16T12:00:00Z', fechaFinVenta: '2026-10-18T12:00:00Z',
  ...cambios,
})

test('la venta incluye exactamente sus fechas de inicio y fin', () => {
  const entrada = oferta()
  assert.equal(estadoOferta(entrada, evento(), new Date(entrada.fechaInicioVenta).getTime()), 'EN_VENTA')
  assert.equal(estadoOferta(entrada, evento(), new Date(entrada.fechaFinVenta).getTime()), 'EN_VENTA')
  assert.equal(estadoOferta(entrada, evento(), new Date(entrada.fechaInicioVenta).getTime() - 1), 'PROXIMAMENTE')
  assert.equal(estadoOferta(entrada, evento(), new Date(entrada.fechaFinVenta).getTime() + 1), 'FINALIZADO')
  assert.equal(estadoOferta(oferta({ fechaInicioVenta: null, fechaFinVenta: null }), evento(), AHORA), 'EN_VENTA')
})

test('no habilita ofertas ni eventos que no estén activos', () => {
  for (const estado of ['PAUSADO', 'AGOTADO', 'FINALIZADO', 'DESCONOCIDO']) {
    assert.notEqual(estadoOferta(oferta({ estado }), evento(), AHORA), 'EN_VENTA', estado)
  }
  for (const estado of ['BORRADOR', 'CANCELADO', 'REPROGRAMADO', 'FINALIZADO', '']) {
    assert.notEqual(estadoOferta(oferta(), evento({ estado }), AHORA), 'EN_VENTA', estado)
  }
  assert.equal(estadoOferta(oferta({ estado: 'activo' }), evento({ estado: 'activo' }), AHORA), 'EN_VENTA')
})

test('exige stock entero positivo y precioFinal válido para vender', () => {
  assert.equal(estadoOferta(oferta({ cantidadDisponible: 0 }), evento(), AHORA), 'AGOTADO')
  for (const cantidadDisponible of [-1, 1.5, NaN, undefined, '10']) {
    assert.notEqual(estadoOferta(oferta({ cantidadDisponible }), evento(), AHORA), 'EN_VENTA')
  }
  for (const precioFinal of [-1, NaN, undefined, '900']) {
    assert.notEqual(estadoOferta(oferta({ precioFinal }), evento(), AHORA), 'EN_VENTA')
  }
  assert.equal(estadoOferta(oferta({ precioFinal: 0 }), evento(), AHORA), 'EN_VENTA')
})

test('busca títulos sin acentos y combina la categoría por ID', () => {
  const eventos = [evento(), evento({ id: 2, titulo: 'CAFÉ de tarde', categoriaId: 6 })]
  assert.deepEqual(filtrarEventos(eventos, { busqueda: '  cafe ', categoria: '5' }, AHORA).map(e => e.id), [1])
  assert.equal(filtrarEventos(eventos, { busqueda: 'café' }, AHORA).length, 2)
  assert.equal(filtrarEventos(eventos, { busqueda: 'rock' }, AHORA).length, 0)
})

test('el rango puede coincidir con una oferta que no sea la más barata', () => {
  const entradaBarata = oferta({ id: 1, precioFinal: 100 })
  const entradaBuscada = oferta({ id: 2, precioFinal: 1000 })
  const e = evento({ ofertas: [entradaBarata, entradaBuscada] })
  assert.equal(resumenEntradas(e, AHORA).precioDesde, 100)
  assert.deepEqual(filtrarEventos([e], { precioMin: '900', precioMax: '1100' }, AHORA), [e])
  assert.deepEqual(filtrarEventos([e], { precioMin: '1000', precioMax: '1000' }, AHORA), [e])
})

test('una misma oferta debe cumplir ambos extremos del rango', () => {
  const e = evento({ ofertas: [oferta({ id: 1, precioFinal: 100 }), oferta({ id: 2, precioFinal: 3000 })] })
  assert.deepEqual(filtrarEventos([e], { precioMin: '900', precioMax: '1100' }, AHORA), [])
})

test('el filtro de precio ignora ofertas agotadas, pausadas, futuras y eventos cancelados', () => {
  const ofertasNoVendibles = [
    oferta({ cantidadDisponible: 0 }),
    oferta({ estado: 'PAUSADO' }),
    oferta({ fechaInicioVenta: '2026-10-18T12:00:00Z' }),
    oferta({ fechaFinVenta: '2026-10-16T12:00:00Z' }),
  ]
  const eventos = ofertasNoVendibles.map((entrada, i) => evento({ id: i + 1, ofertas: [entrada] }))
  eventos.push(evento({ id: 5, estado: 'CANCELADO', ofertas: [oferta()] }))
  eventos.push(evento({ id: 6, errorOfertas: 'No se pudo consultar', ofertas: [oferta()] }))
  assert.deepEqual(filtrarEventos(eventos, { precioMin: '800', precioMax: '1000' }, AHORA), [])
  assert.equal(filtrarEventos(eventos, {}, AHORA).length, 6)
})

test('rechaza rangos negativos, invertidos o que no sean números', () => {
  const eventos = [evento({ ofertas: [oferta()] })]
  for (const filtros of [
    { precioMin: '-1' }, { precioMin: '1000', precioMax: '100' },
    { precioMin: 'texto' }, { precioMax: 'texto' },
  ]) assert.deepEqual(filtrarEventos(eventos, filtros, AHORA), [])
})

test('ajusta cantidades a enteros y stock real, sin imponer un límite de diez', () => {
  const ofertas = [oferta({ id: 1, cantidadDisponible: 137 }), oferta({ id: 2, cantidadDisponible: 8 })]
  const seleccion = [
    { ofertaId: 1, cantidad: 200 }, { ofertaId: 2, cantidad: 3.9 },
    { ofertaId: 3, cantidad: 1 }, { ofertaId: 1, cantidad: -2 }, { ofertaId: 2, cantidad: NaN },
  ]
  assert.deepEqual(ajustarSeleccion(seleccion, ofertas, evento(), AHORA), [
    { ofertaId: 1, cantidad: 137 }, { ofertaId: 2, cantidad: 3 },
  ])
  assert.deepEqual(ajustarSeleccion([{ ofertaId: 1, cantidad: 20 }], ofertas, evento(), AHORA), [
    { ofertaId: 1, cantidad: 20 },
  ])
})

test('descarta selecciones si el stock baja a cero o deja de estar a la venta', () => {
  const seleccion = [{ ofertaId: 1, cantidad: 12 }]
  assert.deepEqual(ajustarSeleccion(seleccion, [oferta({ cantidadDisponible: 4 })], evento(), AHORA), [
    { ofertaId: 1, cantidad: 4 },
  ])
  for (const entrada of [oferta({ cantidadDisponible: 0 }), oferta({ estado: 'PAUSADO' })]) {
    assert.deepEqual(ajustarSeleccion(seleccion, [entrada], evento(), AHORA), [])
  }
  assert.deepEqual(ajustarSeleccion(seleccion, [oferta()], evento({ estado: 'CANCELADO' }), AHORA), [])
})

test('usa precioFinal del backend y suma los importes en centavos', () => {
  // El backend redondea 0,005 de descuento a 0,01 antes de restarlo a 0,05.
  const entrada = oferta({ precio: 0.05, porcentajeDescuento: 10, precioFinal: 0.04 })
  assert.equal(resumenEntradas(evento({ ofertas: [entrada] }), AHORA).precioDesde, 0.04)
  assert.equal(totalSeleccion([{ ofertaId: 1, cantidad: 3 }], [entrada]), 0.12)
  const ofertas = [oferta({ id: 1, precioFinal: 0.1 }), oferta({ id: 2, precioFinal: 0.2 })]
  assert.equal(totalSeleccion([{ ofertaId: 1, cantidad: 3 }, { ofertaId: 2, cantidad: 1 }], ofertas), 0.5)
  assert.equal(totalSeleccion([], ofertas), 0)
})

test('el resumen informa ausencia de entradas o error sin inventar un precio', () => {
  assert.deepEqual(resumenEntradas(evento(), AHORA), { precioDesde: null, estado: 'SIN_ENTRADAS', disponibles: 0 })
  assert.equal(resumenEntradas(evento({ errorOfertas: 'Sin conexión' }), AHORA).estado, 'ERROR')
  const resumen = resumenEntradas(evento({ ofertas: [oferta({ precioFinal: undefined })] }), AHORA)
  assert.equal(resumen.precioDesde, null)
  assert.equal(resumen.disponibles, 0)
})

test('distingue venta cerrada de evento finalizado y conserva cancelación aunque fallen ofertas', () => {
  const cerrado = evento({ ofertas: [oferta({ fechaFinVenta: '2026-10-16T12:00:00Z' })] })
  assert.equal(resumenEntradas(cerrado, AHORA).estado, 'VENTA_FINALIZADA')
  assert.equal(resumenEntradas({ ...cerrado, estado: 'FINALIZADO' }, AHORA).estado, 'FINALIZADO')
  assert.equal(resumenEntradas(evento({ estado: 'CANCELADO', errorOfertas: 'Sin red' }), AHORA).estado, 'CANCELADO')
})

test('descarta cantidades no finitas en lugar de convertirlas en toda la disponibilidad', () => {
  for (const cantidad of [Infinity, -Infinity, NaN, undefined, '3']) {
    assert.deepEqual(ajustarSeleccion([{ ofertaId: 1, cantidad }], [oferta()], evento(), AHORA), [])
  }
})


test('los importes inválidos no desaparecen ni se convierten en filtros vacíos', () => {
  for (const valor of ['-1', 'texto', '0x10', 'Infinity', '8.500,50', '8500.501']) {
    const filtros = leerFiltrosCatalogo(new URLSearchParams({ min: valor }))
    assert.equal(filtros.precioMin, valor)
    assert.ok(filtros.errorPrecio, valor)
  }
  assert.equal(leerFiltrosCatalogo(new URLSearchParams({ min: '0', max: '0' })).errorPrecio, '')
})

test('acepta centavos con coma o punto y valida los dos extremos juntos', () => {
  assert.equal(normalizarImporteFiltro(' 8500,50 '), '8500.50')
  assert.equal(validarRangoPrecios('8500,50', '8500.50'), '')
  assert.match(validarRangoPrecios('8500,51', '8500.50'), /mínimo/)
  assert.match(validarRangoPrecios('', '-1'), /negativos/)
  assert.equal(validarRangoPrecios('', ''), '')
})

test('la tarjeta muestra el precio de una oferta dentro del rango, incluido cero', () => {
  const e = evento({ ofertas: [oferta({ precioFinal: 0 }), oferta({ id: 2, precioFinal: 42499.99 })] })
  assert.equal(precioDesdeEnRango(e, { precioMin: '18000' }, AHORA), 42499.99)
  assert.equal(precioDesdeEnRango(e, { precioMin: '42499,99', precioMax: '42499.99' }, AHORA), 42499.99)
  assert.equal(precioDesdeEnRango(e, { precioMin: '0', precioMax: '0' }, AHORA), 0)
  assert.equal(precioDesdeEnRango(e, { precioMin: '100', precioMax: '200' }, AHORA), null)
  assert.equal(precioDesdeEnRango(e, { precioMin: '-1' }, AHORA), null)
})
