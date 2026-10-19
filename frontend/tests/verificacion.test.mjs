import { after, afterEach, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import { QRCodeSVG } from 'qrcode.react'
import { createServer } from 'vite'
import { ErrorApi } from '../src/utils/apiEventos.js'
import { consultarTicket, utilizarTicket } from '../src/utils/apiTickets.js'
import { datosDeTicket, resultadoDeTicket, urlVerificacion } from '../src/utils/verificacion.js'

const CODIGO = '11111111-aaaa-bbbb-cccc-222222222222'
const ticket = {
  id: 7, codigoQr: CODIGO, estado: 'EMITIDO', fechaUtilizacion: null,
  compradorNombre: 'Lucia Perez', eventoTitulo: 'After Palace', locacionNombre: 'Palacio Balcarce',
  eventoFechaHoraInicio: '2026-10-24T23:00:00', eventoFechaHoraFin: '2026-10-25T05:00:00',
  tipoEntradaNombre: 'VIP',
}

describe('link que guarda el QR', () => {
  test('lleva a la pantalla de verificación con el código de la entrada', () => {
    assert.equal(urlVerificacion(CODIGO), `http://localhost:5173/verificar/${CODIGO}`)
  })
  test('un código con caracteres raros no rompe el link', () => {
    assert.equal(urlVerificacion('a b/c'), 'http://localhost:5173/verificar/a%20b%2Fc')
  })
})

describe('qué se le dice al organizador', () => {
  test('una entrada emitida es válida', () => {
    const resultado = resultadoDeTicket(ticket)
    assert.equal(resultado.valido, true)
    assert.equal(resultado.titulo, 'Entrada válida')
  })
  test('una entrada ya utilizada no es válida y dice cuándo se usó', () => {
    const resultado = resultadoDeTicket({ ...ticket, estado: 'UTILIZADO', fechaUtilizacion: '2026-10-24T23:41:00' })
    assert.equal(resultado.valido, false)
    assert.equal(resultado.titulo, 'Entrada ya utilizada')
    assert.match(resultado.mensaje, /24\/10, 23:41/)
  })
  test('una entrada cancelada y un estado desconocido no son válidos', () => {
    assert.equal(resultadoDeTicket({ ...ticket, estado: 'CANCELADO' }).valido, false)
    assert.equal(resultadoDeTicket({ ...ticket, estado: 'OTRO' }).valido, false)
  })
  test('recién registrado el ingreso se confirma aunque la entrada ya figure como utilizada', () => {
    const resultado = resultadoDeTicket({ ...ticket, estado: 'UTILIZADO' }, true)
    assert.equal(resultado.valido, true)
    assert.equal(resultado.titulo, 'Ingreso registrado')
  })
  test('los datos dicen a quién pertenece, el evento, la fecha, el lugar y el tipo', () => {
    const datos = Object.fromEntries(datosDeTicket(ticket).map((d) => [d.etiqueta, d.valor]))
    assert.equal(datos['A nombre de'], 'Lucia Perez')
    assert.equal(datos.Evento, 'After Palace')
    assert.match(datos.Fecha, /24 de octubre/)
    assert.equal(datos.Lugar, 'Palacio Balcarce')
    assert.equal(datos.Entrada, 'VIP')
  })
})

describe('pedidos al back', () => {
  const fetchOriginal = globalThis.fetch
  function simularFetch(estado, cuerpo) {
    const llamadas = []
    globalThis.fetch = async (ruta, opciones) => {
      llamadas.push({ ruta, opciones })
      return new Response(JSON.stringify(cuerpo), { status: estado, headers: { 'Content-Type': 'application/json' } })
    }
    return llamadas
  }
  afterEach(() => { globalThis.fetch = fetchOriginal })

  test('consultar pide el ticket con el token del organizador y sin gastarlo (GET)', async () => {
    const llamadas = simularFetch(200, ticket)
    assert.deepEqual(await consultarTicket('TOKEN', CODIGO), ticket)
    assert.equal(llamadas[0].ruta, `/api/tickets/qr/${CODIGO}`)
    assert.equal(llamadas[0].opciones.method, 'GET')
    assert.equal(llamadas[0].opciones.headers.Authorization, 'Bearer TOKEN')
  })
  test('utilizar registra el ingreso (POST)', async () => {
    const llamadas = simularFetch(200, { ...ticket, estado: 'UTILIZADO' })
    assert.equal((await utilizarTicket('TOKEN', CODIGO)).estado, 'UTILIZADO')
    assert.equal(llamadas[0].ruta, `/api/tickets/qr/${CODIGO}/utilizar`)
    assert.equal(llamadas[0].opciones.method, 'POST')
  })
  test('un código que no existe falla con 404 y el mensaje del back', async () => {
    simularFetch(404, { message: 'El ticket no existe' })
    await assert.rejects(consultarTicket('TOKEN', 'no-existe'), (error) => {
      assert.ok(error instanceof ErrorApi)
      assert.equal(error.estado, 404)
      assert.equal(error.message, 'El ticket no existe')
      return true
    })
  })
  test('una entrada ya usada falla con 409', async () => {
    simularFetch(409, { message: 'El ticket no se puede utilizar (ya fue usado o esta cancelado)' })
    await assert.rejects(utilizarTicket('TOKEN', CODIGO), (error) => error.estado === 409)
  })
})

describe('pantallas', () => {
  let servidor, CodigoQR, TarjetaEntrada, VerificarEntrada
  before(async () => {
    servidor = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' }) // sin WebSocket: evita chocar de puerto con otros tests
    CodigoQR = (await servidor.ssrLoadModule('/src/components/CodigoQR.jsx')).default
    TarjetaEntrada = (await servidor.ssrLoadModule('/src/components/TarjetaEntrada.jsx')).default
    VerificarEntrada = (await servidor.ssrLoadModule('/src/views/VerificarEntrada.jsx')).default
  })
  after(async () => { await servidor?.close() })

  const mostrar = (elemento) => renderToStaticMarkup(createElement(MemoryRouter, null, elemento))
  const verificar = (usuario) => renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [`/verificar/${CODIGO}`] },
      createElement(Routes, null,
        createElement(Route, { path: '/verificar/:codigo', element: createElement(VerificarEntrada, { usuario }) }))),
  )

  test('el QR es un SVG real que guarda el link de verificación', () => {
    const esperado = renderToStaticMarkup(createElement(QRCodeSVG, {
      value: urlVerificacion(CODIGO), size: 166, level: 'M', bgColor: '#F4F1E8', fgColor: '#0A0A0A',
      role: 'img', 'aria-label': 'Código QR de la entrada',
    }))
    const html = mostrar(createElement(CodigoQR, { codigoQr: CODIGO }))
    assert.equal(html, esperado)
    assert.match(html, /^<svg /)
    assert.notEqual(html, mostrar(createElement(CodigoQR, { codigoQr: 'otro-codigo' })))
  })
  test('la entrada de "Mis entradas" muestra el QR real y no el dibujo de relleno', () => {
    const entrada = { id: 1, tipo: 'VIP', estado: 'EMITIDO', codigoQr: CODIGO, eventoTitulo: 'After Palace' }
    const html = mostrar(createElement(TarjetaEntrada, { entrada, comprador: 'Lucia Perez', numero: 1, total: 1 }))
    assert.match(html, /aria-label="Código QR de la entrada"/)
    assert.doesNotMatch(html, /Marcador de código QR/)
  })
  test('un visitante tiene que ingresar y vuelve a la verificación después', () => {
    const html = verificar(null)
    assert.match(html, /Ingresá como organizador/)
    assert.match(html, /href="\/login"/)
  })
  test('un usuario común no puede verificar entradas', () => {
    assert.match(verificar({ rol: 'USER', token: 'T' }), /Solo el organizador puede verificar entradas/)
  })
  test('el organizador ve que se está verificando mientras llega la respuesta', () => {
    assert.match(verificar({ rol: 'ADMIN', token: 'T' }), /Verificando entrada/)
  })
})
