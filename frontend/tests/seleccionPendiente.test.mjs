import { beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { guardarSeleccionPendiente, leerSeleccionPendiente, borrarSeleccionPendiente, destinoTrasIngresar } from '../src/utils/seleccionPendiente.js'

let valores
beforeEach(() => {
  valores = new Map()
  globalThis.sessionStorage = {
    getItem: clave => valores.get(clave) ?? null,
    setItem: (clave, valor) => valores.set(clave, valor),
    removeItem: clave => valores.delete(clave),
  }
  borrarSeleccionPendiente()
})
test('conserva la entrada elegida, su cantidad y el origen durante el acceso', () => {
  guardarSeleccionPendiente(7, 12, 2, '/?categoria=2#fechas')
  assert.deepEqual(leerSeleccionPendiente(), { eventoId: 7, ofertaId: 12, cantidad: 2, volverA: '/?categoria=2#fechas' })
  assert.equal(destinoTrasIngresar({ rol: 'USER' }), '/eventos/7')
})
test('se recupera al recargar el módulo, como al recargar la página de login', async () => {
  guardarSeleccionPendiente(7, 12, 2, '/')
  const recargado = await import('../src/utils/seleccionPendiente.js?recarga')
  assert.equal(recargado.leerSeleccionPendiente().ofertaId, 12)
})
test('borrar la intención impide repetir el agregado al volver o recargar', () => {
  guardarSeleccionPendiente(7, 12, 2, '/')
  borrarSeleccionPendiente()
  assert.equal(leerSeleccionPendiente(), null)
  assert.equal(destinoTrasIngresar({ rol: 'USER' }), '/')
})
test('el acceso de administrador descarta la compra y abre administración', () => {
  guardarSeleccionPendiente(7, 12, 2, '/')
  assert.equal(destinoTrasIngresar({ rol: 'ADMIN' }), '/admin')
  assert.equal(leerSeleccionPendiente(), null)
})
test('datos de almacenamiento inválidos no generan una compra', () => {
  valores.set('zenoir.seleccionPendiente', '{malformado')
  assert.equal(leerSeleccionPendiente(), null)
  valores.set('zenoir.seleccionPendiente', JSON.stringify({ eventoId: 7, ofertaId: 12, cantidad: -1 }))
  assert.equal(leerSeleccionPendiente(), null)
})
test('si el navegador bloquea el almacenamiento, conserva la intención en memoria', () => {
  globalThis.sessionStorage = { getItem() { throw Error() }, setItem() { throw Error() }, removeItem() { throw Error() } }
  guardarSeleccionPendiente(7, 12, 2, '/')
  assert.equal(leerSeleccionPendiente().cantidad, 2)
  borrarSeleccionPendiente()
  assert.equal(leerSeleccionPendiente(), null)
})
