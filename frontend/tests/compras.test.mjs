import test from 'node:test'
import assert from 'node:assert/strict'
import {
  agruparPorEvento, cantidadDeEntradas, comprasDelEvento, eventoAfectado, eventoCancelado, eventoReprogramado,
  permiteReembolso, reemplazarCompra, sePuedeReembolsar,
} from '../src/utils/compras.js'

const AHORA = Date.parse('2026-10-20T12:00:00-03:00')
const eventos = {
  1: { id: 1, titulo: 'After Palace', fechaHoraInicio: '2026-10-24T23:00:00', fechaHoraFin: '2026-10-25T05:00:00' },
  2: { id: 2, titulo: 'Noche Italiana', fechaHoraInicio: '2026-11-21T23:00:00', fechaHoraFin: '2026-11-22T05:00:00' },
  3: { id: 3, titulo: 'Golden Edition', fechaHoraInicio: '2026-07-31T23:00:00', fechaHoraFin: '2026-08-01T05:00:00' },
}
const entrada = (id, eventoId) => ({ id, eventoId, eventoTitulo: eventos[eventoId].titulo, codigoQr: `qr-${id}` })

test('las entradas se agrupan por evento: primero los que vienen (del más próximo) y al final los que ya pasaron', () => {
  const grupos = agruparPorEvento([entrada(1, 2), entrada(2, 3), entrada(3, 1), entrada(4, 2)], eventos, AHORA)
  assert.deepEqual(grupos.map((g) => g.id), [1, 2, 3])
  assert.deepEqual(grupos[1].entradas.map((e) => e.id), [1, 4])
  assert.equal(grupos[0].evento.titulo, 'After Palace')
})
test('sin el evento cargado, el grupo conserva el título que trae la entrada', () => {
  const [grupo] = agruparPorEvento([entrada(1, 1)], {}, AHORA)
  assert.equal(grupo.titulo, 'After Palace')
  assert.equal(grupo.evento, undefined)
})

const compra = (id, estado, eventoIds) => ({
  id, estado, total: 1000, detalles: eventoIds.map((eventoId) => ({ eventoId, tickets: [{ id: id * 10 + eventoId }, { id: id * 10 + eventoId + 100 }] })),
})

test('una compra se puede reembolsar solo si sigue confirmada y todos sus eventos lo permiten', () => {
  const cancelados = { 1: { estado: 'CANCELADO' }, 2: { estado: 'cancelado' }, 3: { estado: 'ACTIVO' } }
  assert.equal(eventoCancelado(cancelados[1]), true)
  assert.equal(eventoCancelado(cancelados[2]), true)
  assert.equal(eventoCancelado(cancelados[3]), false)
  assert.equal(eventoCancelado(undefined), false)
  assert.equal(sePuedeReembolsar(compra(1, 'CONFIRMADA', [1, 2]), cancelados), true)
  assert.equal(sePuedeReembolsar(compra(1, 'CONFIRMADA', [1, 3]), cancelados), false)
  assert.equal(sePuedeReembolsar(compra(1, 'CANCELADA', [1]), cancelados), false)
  assert.equal(sePuedeReembolsar(compra(1, 'CONFIRMADA', [9]), cancelados), false)
})

test('encuentra las compras de un evento, cuenta sus entradas y reemplaza la reembolsada sin tocar las demás', () => {
  const compras = [compra(1, 'CONFIRMADA', [1]), compra(2, 'CONFIRMADA', [2]), compra(3, 'CONFIRMADA', [1, 2])]
  assert.deepEqual(comprasDelEvento(compras, 1).map((c) => c.id), [1, 3])
  assert.equal(cantidadDeEntradas(compras[2]), 4)
  const cancelada = { ...compras[0], estado: 'CANCELADA' }
  const nuevas = reemplazarCompra(compras, cancelada)
  assert.deepEqual(nuevas.map((c) => c.estado), ['CANCELADA', 'CONFIRMADA', 'CONFIRMADA'])
  assert.equal(nuevas[1], compras[1])
})

test('un evento reprogramado cuenta como afectado y, como el cancelado, permite el reembolso', () => {
  assert.equal(eventoReprogramado({ estado: 'REPROGRAMADO' }), true)
  assert.equal(eventoAfectado({ estado: 'REPROGRAMADO' }), true)
  assert.equal(eventoAfectado({ estado: 'CANCELADO' }), true)
  assert.equal(eventoAfectado({ estado: 'ACTIVO' }), false)
  assert.equal(permiteReembolso({ estado: 'CANCELADO' }), true)
  assert.equal(permiteReembolso({ estado: 'REPROGRAMADO' }), true)
  assert.equal(permiteReembolso({ estado: 'ACTIVO' }), false)
  assert.equal(sePuedeReembolsar(compra(1, 'CONFIRMADA', [1]), { 1: { estado: 'REPROGRAMADO' } }), true)
})
