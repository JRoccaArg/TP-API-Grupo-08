import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let servidor, FilaEntrada, BarraCompra, ResumenCompra, FlyerEvento, TarjetaFlyer, FiltrosEventos
const evento = { id: 1, titulo: 'Noche de prueba', estado: 'ACTIVO', imagenes: [] }
const oferta = {
  id: 1, tipoEntradaNombre: 'General', estado: 'ACTIVO', cantidadDisponible: 3,
  precio: 10000, porcentajeDescuento: 10, precioFinal: 9000,
}
const ahora = new Date('2026-10-17T12:00:00Z').getTime()
const mostrarFila = (cambios = {}, cambiosEvento = {}) => renderToStaticMarkup(
  createElement(FilaEntrada, { oferta: { ...oferta, ...cambios }, evento: { ...evento, ...cambiosEvento },
    cantidad: 0, ahora, onCambiar: () => {} }),
)

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  TarjetaFlyer = (await servidor.ssrLoadModule('/src/components/TarjetaFlyer.jsx')).default
  FiltrosEventos = (await servidor.ssrLoadModule('/src/components/FiltrosEventos.jsx')).default
  FilaEntrada = (await servidor.ssrLoadModule('/src/components/FilaEntrada.jsx')).default
  BarraCompra = (await servidor.ssrLoadModule('/src/components/BarraCompra.jsx')).default
  ResumenCompra = (await servidor.ssrLoadModule('/src/components/ResumenCompra.jsx')).default
  FlyerEvento = (await servidor.ssrLoadModule('/src/components/FlyerEvento.jsx')).default
})
after(async () => { await servidor?.close() })

test('una oferta agotada informa stock y no renderiza controles de selección', () => {
  const html = mostrarFila({ cantidadDisponible: 0 })
  assert.match(html, /Stock agotado/)
  assert.doesNotMatch(html, /class="selector"/)
})
test('ofertas pausadas, cerradas y eventos cancelados no permiten elegir cantidades', () => {
  for (const [entrada, e] of [
    [{ estado: 'PAUSADO' }, {}], [{ estado: 'FINALIZADO' }, {}],
    [{ fechaFinVenta: '2026-10-16T12:00:00Z' }, {}], [{}, { estado: 'CANCELADO' }],
  ]) assert.doesNotMatch(mostrarFila(entrada, e), /class="selector"/)
})
test('la venta futura muestra su fecha y no renderiza el selector', () => {
  const html = mostrarFila({ fechaInicioVenta: '2026-10-18T12:00:00Z' })
  assert.match(html, /Venta desde/)
  assert.doesNotMatch(html, /class="selector"/)
})
test('precio original, descuento y precioFinal del backend se muestran juntos', () => {
  const html = mostrarFila()
  assert.match(html, /10%/)
  assert.match(html, /\$10\.000/)
  assert.match(html, /\$9\.000/)
  assert.match(html, /3 disponibles/)
  assert.match(html, /class="selector"/)
})
test('sin integración la barra informa total real y no ofrece una compra habilitada', () => {
  const html = renderToStaticMarkup(createElement(BarraCompra, {
    seleccion: [{ ofertaId: 1, cantidad: 2 }], ofertas: [oferta], conectado: false,
  }))
  assert.match(html, /\$18\.000/)
  assert.match(html, /disabled=""/)
  assert.match(html, /Compra no disponible/)
  assert.match(html, /no reserva stock/)
})
test('la galería presenta todas las imágenes y tiene una alternativa cuando está vacía', () => {
  const imagenes = [1, 2, 3].map(id => ({ id, url: `/api/eventos/1/imagenes/${id}/archivo` }))
  const html = renderToStaticMarkup(createElement(FlyerEvento, { evento: { ...evento, imagenes } }))
  assert.equal((html.match(/aria-pressed=/g) || []).length, 3)
  assert.match(html, /aria-pressed="true"/)
  const sinImagen = renderToStaticMarkup(createElement(FlyerEvento, { evento }))
  assert.match(sinImagen, /Imagen no disponible/)
  assert.doesNotMatch(html, /Imagen no disponible/)
  assert.match(html, /\/api\/eventos\/1\/imagenes\/1\/archivo/)
  // Aunque el título se parezca a uno viejo, no se pone ninguna imagen que no venga del back.
  const haunted = renderToStaticMarkup(createElement(FlyerEvento, { evento: { ...evento, titulo: 'Haunted Edition' } }))
  assert.match(haunted, /Imagen no disponible/)
  assert.doesNotMatch(haunted, /<img/)
})


test('la tarjeta identifica el precio dentro del rango sin cambiar el precio general del evento', () => {
  const e = { ...evento, ofertas: [{ ...oferta, precioFinal: 0 }, { ...oferta, id: 2, precioFinal: 42499.99 }] }
  const mostrar = (filtroPrecio) => renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(TarjetaFlyer, { evento: e, ahora, filtroPrecio })))
  assert.match(mostrar({ precioMin: '18000' }), /EN TU RANGO/)
  assert.match(mostrar({ precioMin: '18000' }), /42\.499,99/)
  assert.doesNotMatch(mostrar({ precioMin: '18000' }), /oro-texto">\$0</)
  assert.match(mostrar({}), /oro-texto">\$0</)
  assert.match(mostrar({ precioMax: '0' }), /oro-texto">\$0</)
})

test('los campos conservan importes inválidos y muestran el motivo de validación', () => {
  const html = renderToStaticMarkup(createElement(FiltrosEventos, {
    filtros: { busqueda: '', categoria: '', precioMin: '-1', precioMax: '' }, categorias: [],
    errorPrecio: 'Los precios no pueden ser negativos.', hayFiltros: true,
    onCambiar: () => {}, onLimpiar: () => {},
  }))
  assert.match(html, /value="-1"/)
  assert.match(html, /aria-invalid="true"/)
  assert.match(html, /role="alert">Los precios no pueden ser negativos/)
})
test('la barra de compra aclara que el tiempo de reserva es uno solo para todo el carrito', () => {
  const html = renderToStaticMarkup(createElement(BarraCompra, {
    seleccion: [{ ofertaId: 1, cantidad: 1 }], ofertas: [oferta], conectado: true,
  }))
  assert.match(html, /mismo para todo el carrito/)
})
test('el resumen del carrito avisa que el reloj del pago no se reinicia si ya se abrió', () => {
  const mostrarResumen = (estado) => renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(ResumenCompra, { carrito: { id: 1, estado, items: [], total: 0 }, onIrAPagar: () => {} })))
  assert.match(mostrarResumen('ACTIVO'), /15 minutos más/)
  assert.match(mostrarResumen('EN_PAGO'), /no se reinicia/)
  assert.doesNotMatch(mostrarResumen('EN_PAGO'), /15 minutos más/)
})
