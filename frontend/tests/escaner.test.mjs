import test from 'node:test'
import assert from 'node:assert/strict'
import { codigoDesdeQr, mensajeDeCamara } from '../src/utils/escaner.js'
import { resultadoDeTicket } from '../src/utils/verificacion.js'

test('del texto del QR sale el código de la entrada (link completo, con IP o código solo)', () => {
  assert.equal(codigoDesdeQr('http://localhost:5173/verificar/6f9984a5-a340'), '6f9984a5-a340')
  assert.equal(codigoDesdeQr('http://192.168.0.15:5173/verificar/abc%20123?x=1'), 'abc 123')
  assert.equal(codigoDesdeQr('  6f9984a5-a340  '), '6f9984a5-a340')
})
test('los errores de cámara se explican con palabras claras', () => {
  assert.match(mensajeDeCamara({ kind: 'permission-denied' }), /permiso/)
  assert.match(mensajeDeCamara({ kind: 'insecure-context' }), /https/)
  assert.match(mensajeDeCamara({ kind: 'algo-raro' }), /No se pudo abrir la cámara/)
})
test('desde el escáner de un evento, una entrada de otro evento no vale', () => {
  const ticket = { estado: 'EMITIDO', eventoId: 2, eventoTitulo: 'Noche Italiana' }
  assert.equal(resultadoDeTicket(ticket, false, 2).valido, true)
  const otro = resultadoDeTicket(ticket, false, 1)
  assert.equal(otro.valido, false)
  assert.match(otro.mensaje, /Noche Italiana/)
  assert.equal(resultadoDeTicket(ticket).valido, true)
})
