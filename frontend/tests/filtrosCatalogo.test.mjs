import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leerFiltrosCatalogo, conParametros, consultaCatalogo, hayFiltros } from '../src/utils/filtrosCatalogo.js'

test('la consulta del catálogo pide cuatro eventos de la página elegida con los filtros de la URL', () => {
  const consulta = consultaCatalogo({ busqueda: ' Café & Jazz ', categoria: '5', precioMin: '0', precioMax: '8500,50', pagina: 3 })
  assert.deepEqual(Object.fromEntries(new URLSearchParams(consulta)), {
    page: '2', size: '4', catalogo: 'true', estadoEvento: 'proximos', orden: 'proximos', nombre: 'Café & Jazz', categoriaId: '5', precioMin: '0', precioMax: '8500.50',
  })
})

test('la misma página con los mismos filtros arma la misma consulta (así no se pide dos veces)', () => {
  const filtros = leerFiltrosCatalogo(new URLSearchParams('?categoria=2&orden=lejanos&pagina=2'))
  assert.equal(consultaCatalogo(filtros), consultaCatalogo(leerFiltrosCatalogo(new URLSearchParams('?pagina=2&orden=lejanos&categoria=2'))))
})

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
