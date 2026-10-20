import test from 'node:test'
import assert from 'node:assert/strict'
import { agruparPorEvento } from '../src/utils/compras.js'

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
