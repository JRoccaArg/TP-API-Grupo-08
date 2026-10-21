import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let servidor, AvisoEventoAfectado, formatos, fechas, Cinta, BarraProximaFecha, FilaEntrada, BarraCompra, ResumenCompra, FlyerEvento, TarjetaFlyer, FiltrosEventos
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
  formatos = await servidor.ssrLoadModule('/src/utils/formatos.js')
  AvisoEventoAfectado = (await servidor.ssrLoadModule('/src/components/AvisoEventoAfectado.jsx')).default
  fechas = await servidor.ssrLoadModule('/src/utils/fechas.js')
  Cinta = (await servidor.ssrLoadModule('/src/components/Cinta.jsx')).default
  BarraProximaFecha = (await servidor.ssrLoadModule('/src/components/BarraProximaFecha.jsx')).default
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

test('el rango señala los importes inválidos de la URL y muestra el motivo de validación', () => {
  const html = renderToStaticMarkup(createElement(FiltrosEventos, {
    filtros: { busqueda: '', categoria: '', precioMin: '-1', precioMax: '' }, categorias: [],
    errorPrecio: 'Los precios no pueden ser negativos.', hayFiltros: true,
    onCambiar: () => {}, onLimpiar: () => {},
  }))
  assert.match(html, /type="range"/)
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

test('un importe con centavos lleva siempre dos decimales y uno entero ninguno; las cantidades llevan separador de miles', () => {
  assert.equal(formatos.precio(0.5), '$0,50')
  assert.equal(formatos.precio(1234.5), '$1.234,50')
  assert.equal(formatos.precio(9000), '$9.000')
  assert.equal(formatos.miles(2000000), '2.000.000')
})
test('un evento de un dia o mas aclara el dia en que termina; uno de una noche no', () => {
  assert.equal(fechas.horario('2026-10-21T00:01:00-03:00', '2026-10-24T00:01:00-03:00'), '00:01 a 24.10 00:01 h')
  assert.equal(fechas.horario('2026-10-21T22:00:00-03:00', '2026-10-22T04:00:00-03:00'), '22 a 04 h')
})
test('la barra de la proxima fecha corta los titulos largos y marca el evento que ya empezo', () => {
  const evento = { id: 1, titulo: 'Titulo '.repeat(30), locacionNombre: 'Lugar', fechaHoraInicio: '2999-01-01T22:00:00-03:00', fechaHoraFin: '2999-01-02T04:00:00-03:00' }
  const mostrar = (cambios) => renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(BarraProximaFecha, { evento: { ...evento, ...cambios }, origen: {} })))
  assert.match(mostrar({}), /Próxima/)
  assert.match(mostrar({}), /DÍAS · HORAS · MIN/)
  assert.match(mostrar({}), /<h2 class="barra-fecha__nombre" title="Titulo/)
  const enCurso = mostrar({ fechaHoraInicio: '2020-01-01T22:00:00-03:00', fechaHoraFin: '2999-01-02T04:00:00-03:00' })
  assert.match(enCurso, /Ocurre/)
  assert.match(enCurso, /EN CURSO/)
  assert.doesNotMatch(enCurso, /DÍAS · HORAS · MIN/)
})
test('la cinta se repite hasta cubrir la pantalla con pocos eventos y mantiene su velocidad con muchos', () => {
  const eventos = (cuantos, titulo) => Array.from({ length: cuantos }, (_, i) => ({ id: i + 1, titulo }))
  const listas = (html) => (html.match(/class="cinta__lista"/g) || []).length
  const duracion = (html) => Number(html.match(/animation-duration:(\d+)s/)[1])
  const vacia = renderToStaticMarkup(createElement(Cinta, { eventos: [] }))
  const pocos = renderToStaticMarkup(createElement(Cinta, { eventos: eventos(1, 'Noche') }))
  const muchos = renderToStaticMarkup(createElement(Cinta, { eventos: eventos(200, 'M'.repeat(150)) }))
  assert.ok(listas(vacia) > 2 && listas(pocos) > 2)
  assert.equal(listas(muchos), 2)
  assert.ok(duracion(vacia) >= 10 && duracion(vacia) < 40)
  assert.ok(duracion(muchos) > duracion(pocos))
})

test('finalizados, cancelados y agotados muestran su etiqueta y sólo permiten ver el detalle', () => {
  for (const [cambios, etiqueta] of [
    [{ estado: 'FINALIZADO' }, 'Finalizado'], [{ estado: 'CANCELADO' }, 'Cancelado'],
    [{ ofertas: [{ ...oferta, cantidadDisponible: 0 }] }, 'Agotado'],
  ]) {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(TarjetaFlyer, {
      evento: { ...evento, ofertas: [oferta], ...cambios }, ahora,
    })))
    assert.match(html, new RegExp(`flyer__estado[^>]*>${etiqueta}`))
    assert.doesNotMatch(html, /aria-label="Comprar entradas/)
    assert.match(html, /Ver detalle/)
  }
})

test('la barra de precios tiene dos tiradores y usa el máximo real del catálogo', () => {
  const html = renderToStaticMarkup(createElement(FiltrosEventos, {
    filtros: { busqueda: '', categoria: '', precioMin: '5000', precioMax: '25000' }, categorias: [],
    maximoPrecio: 42499.99, errorPrecio: '', hayFiltros: true, onCambiar: () => {}, onLimpiar: () => {},
  }))
  assert.equal((html.match(/type="range"/g) || []).length, 2)
  assert.match(html, /max="50000"/)
  assert.match(html, /\$5\.000 – \$25\.000/)
  assert.match(html, /aria-label="Precio mínimo"/)
  assert.match(html, /aria-label="Precio máximo"/)
})
test('el aviso de un evento cancelado ofrece reembolsar solo sus entradas, con el importe, y avisa de las usadas', () => {
  const detalle = (eventoId, estados) => ({ eventoId, precioUnitario: 4000, tickets: estados.map((estado, id) => ({ id, estado })) })
  const compras = [{ id: 7, estado: 'CONFIRMADA', total: 20000, detalles: [detalle(1, ['EMITIDO', 'EMITIDO', 'UTILIZADO']), detalle(2, ['EMITIDO'])] }]
  const mostrar = (lista) => renderToStaticMarkup(createElement(AvisoEventoAfectado,
    { evento: { id: 1, estado: 'CANCELADO' }, compras: lista, token: 't', onReembolsada: () => {} }))
  const html = mostrar(compras)
  assert.match(html, /Este evento fue cancelado/)
  assert.match(html, /3 entradas de este evento/)
  assert.match(html, /Pedir reembolso de \$8\.000/)
  assert.match(html, /Una entrada ya se usó y no se reembolsa/)
  const reembolsada = [{ ...compras[0], detalles: [detalle(1, ['CANCELADO', 'CANCELADO', 'UTILIZADO']), detalle(2, ['EMITIDO'])] }]
  assert.match(mostrar(reembolsada), /Reembolso de \$8\.000 pedido/)
  assert.doesNotMatch(mostrar(reembolsada), /Pedir reembolso/)
})
