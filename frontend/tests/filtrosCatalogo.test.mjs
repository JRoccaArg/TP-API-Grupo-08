import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leerFiltrosCatalogo, conParametros, hayFiltros } from '../src/utils/filtrosCatalogo.js'

test('el catálogo abre en próximos y fecha ascendente', () => {
  const filtros = leerFiltrosCatalogo(new URLSearchParams())
  assert.equal(filtros.estadoEvento, 'proximos')
  assert.equal(filtros.orden, 'proximos')
  assert.equal(filtros.pagina, 1)
  assert.equal(hayFiltros(filtros), false)
})
test('estado, rango y orden sobreviven al cambio de página y al volver del detalle', () => {
  const search = '?estado=finalizados&min=0&max=25000&orden=mayor-precio'
  const filtros = leerFiltrosCatalogo(new URLSearchParams(conParametros(search, { pagina: '2' })))
  assert.equal(filtros.estadoEvento, 'finalizados')
  assert.equal(filtros.precioMin, '0')
  assert.equal(filtros.orden, 'mayor-precio')
  assert.equal(filtros.pagina, 2)
  assert.equal(hayFiltros(filtros), true)
})
