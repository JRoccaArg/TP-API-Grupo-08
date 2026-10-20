import test from 'node:test'
import assert from 'node:assert/strict'
import { datosDelResumen, porcentaje } from '../src/utils/estadisticas.js'

test('el porcentaje se redondea y no divide por cero', () => {
  assert.equal(porcentaje(7, 155), 5)
  assert.equal(porcentaje(1, 3), 33)
  assert.equal(porcentaje(3, 0), 0)
})
test('las tarjetas del resumen muestran ventas, recaudado, compras e ingresos', () => {
  const datos = datosDelResumen({ vendidas: 7, cupoTotal: 155, recaudado: 118000, compras: 2, ingresados: 1 })
  assert.deepEqual(datos.map((d) => d.valor), ['7 / 155', '$118.000', '2', '1 / 7'])
  assert.match(datos[1].detalle, /Promedio por compra: \$59\.000/)
  assert.equal(datos[3].progreso, 14)
})
test('sin compras, el recaudado lo aclara en lugar de dividir por cero', () => {
  const datos = datosDelResumen({ vendidas: 0, cupoTotal: 100, recaudado: 0, compras: 0, ingresados: 0 })
  assert.equal(datos[1].detalle, 'Todavía no hay compras')
  assert.equal(datos[0].progreso, 0)
})
