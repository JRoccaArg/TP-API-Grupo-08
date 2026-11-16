import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import carritoReducer, { agregarItem, limpiarCarrito, obtenerCarrito } from '../src/redux/carritoSlice.js'
import comprasReducer, { pagarCarrito, reembolsarEvento } from '../src/redux/comprasSlice.js'
import eventosReducer, { obtenerEvento, obtenerImagenes } from '../src/redux/eventosSlice.js'

// Los reducers son funciones puras: se les pasa un estado y la acción que despacha el middleware cuando responde el back.
const inicio = (reducer) => reducer(undefined, { type: 'inicio' })
const carrito = (id, items) => ({ id, estado: 'ACTIVO', fechaVencimiento: '2026-12-01T22:15:00', items, total: 0 })

describe('carrito', () => {
  test('si al vencer el reloj el back devuelve otro carrito, el anterior se venció', () => {
    const conEntradas = carritoReducer(inicio(carritoReducer), obtenerCarrito.fulfilled(carrito(5, [{ id: 1 }]), 'pedido', 'T'))
    assert.equal(conEntradas.vencido, false)
    const otro = carritoReducer(conEntradas, obtenerCarrito.fulfilled(carrito(6, []), 'pedido', 'T'))
    assert.equal(otro.vencido, true)
    assert.equal(otro.carrito.id, 6)
  })
  test('el error de agregar queda con la entrada que se quiso agregar, para mostrarlo en su fila', () => {
    const arg = { token: 'T', eventoTipoEntradaId: 12, cantidad: 3 }
    const agregando = carritoReducer(inicio(carritoReducer), agregarItem.pending('pedido', arg))
    assert.equal(agregando.agregando, 12)
    const estado = carritoReducer(agregando, agregarItem.rejected(null, 'pedido', arg, 'No hay stock suficiente: quedan 2'))
    assert.deepEqual(estado.errorAgregar, { ofertaId: 12, mensaje: 'No hay stock suficiente: quedan 2' })
    assert.equal(estado.agregando, null)
  })
  test('al pagar, el carrito escucha la compra y queda vacío; al salir se limpia todo', () => {
    const conEntradas = carritoReducer(inicio(carritoReducer), obtenerCarrito.fulfilled(carrito(5, [{ id: 1 }]), 'pedido', 'T'))
    const pagado = carritoReducer(conEntradas, pagarCarrito.fulfilled({ id: 30 }, 'pedido', 'T'))
    assert.deepEqual(pagado.carrito.items, [])
    assert.equal(carritoReducer(conEntradas, limpiarCarrito()).cargado, false)
  })
})

describe('compras', () => {
  test('la compra nueva se suma a la lista y queda como la última, para ir a su confirmación', () => {
    const estado = comprasReducer(inicio(comprasReducer), pagarCarrito.fulfilled({ id: 30, detalles: [] }, 'pedido', 'T'))
    assert.equal(estado.ultimaCompra.id, 30)
    assert.deepEqual(estado.items.map((compra) => compra.id), [30])
  })
  test('el reembolso reemplaza solo la compra que respondió el back', () => {
    const conCompras = { ...inicio(comprasReducer), items: [{ id: 1, estado: 'CONFIRMADA' }, { id: 2, estado: 'CONFIRMADA' }], cargado: true }
    const estado = comprasReducer(conCompras, reembolsarEvento.fulfilled({ id: 2, estado: 'CANCELADA' }, 'pedido', { token: 'T', compraId: 2, eventoId: 9 }))
    assert.deepEqual(estado.items.map((compra) => compra.estado), ['CONFIRMADA', 'CANCELADA'])
  })
})

describe('eventos sueltos', () => {
  test('un evento ya pedido no se vuelve a pedir y su error queda con su id', () => {
    const pidiendo = eventosReducer(inicio(eventosReducer), obtenerEvento.pending('pedido', { id: 4 }))
    assert.deepEqual(pidiendo.pedidos, [4])
    const fallo = eventosReducer(pidiendo, obtenerEvento.rejected(new Error('Network Error'), 'pedido', { id: 4 }))
    assert.deepEqual(fallo.errorEvento, { id: 4, mensaje: 'Network Error' })
    const llego = eventosReducer(pidiendo, obtenerEvento.fulfilled({ id: 4, titulo: 'Gala' }, 'pedido', { id: 4 }))
    assert.equal(llego.items[0].titulo, 'Gala')
  })
  test('mientras llegan las fotos, el evento queda marcado para que otra pantalla no las pida de nuevo', () => {
    const conEvento = { ...inicio(eventosReducer), items: [{ id: 4 }] }
    const estado = eventosReducer(conEvento, obtenerImagenes.pending('pedido', { eventoId: 4 }))
    assert.deepEqual(estado.items[0].imagenes, [])
  })
})
