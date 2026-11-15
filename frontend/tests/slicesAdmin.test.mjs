import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import eventosReducer, {
  actualizarEvento, cambiarImagen, crearEvento, crearOferta, eliminarEvento, subirImagen,
} from '../src/redux/eventosSlice.js'
import locacionesReducer, { crearLocacion, eliminarLocacion } from '../src/redux/locacionesSlice.js'

// Los reducers son funciones puras: se les pasa un estado y la acción que despacha el middleware cuando responde el back.
// thunk.fulfilled(payload, idDelPedido, arg) arma esa acción; el arg es lo que despachó el componente (action.meta.arg).
const conEventos = (cambios) => ({
  ...eventosReducer(undefined, { type: 'inicio' }),
  items: [
    { id: 1, titulo: 'Gala', fechaHoraFin: '2026-12-06T03:00:00', imagenes: [{ id: 10, tipoImagenEvento: 'PORTADA', orden: 1 }],
      ofertas: [{ id: 20, fechaFinVenta: '2026-12-06T03:00:00' }] },
    { id: 2, titulo: 'After', imagenes: [], ofertas: [] },
  ],
  todos: [1, 2],
  paginas: [{ consulta: 'page=0', ids: [1, 2] }],
  proximos: [{ id: 1 }],
  ...cambios,
})

describe('eventos del admin', () => {
  test('crear suma el evento sin entradas ni fotos (así no se piden) y vacía lo guardado del catálogo', () => {
    const estado = eventosReducer(conEventos(), crearEvento.fulfilled({ id: 3, titulo: 'Nuevo' }, 'pedido', { token: 'T' }))
    assert.deepEqual(estado.items[2], { id: 3, titulo: 'Nuevo', ofertas: [], imagenes: [] })
    assert.deepEqual(estado.todos, [1, 2, 3])
    assert.deepEqual(estado.paginas, [])
    assert.equal(estado.proximos, null)
  })
  test('si cambia el fin, las entradas guardadas cierran la venta en el nuevo fin (como hace el back)', () => {
    const estado = eventosReducer(conEventos(), actualizarEvento.fulfilled(
      { id: 1, titulo: 'Gala', fechaHoraFin: '2026-12-08T03:00:00' }, 'pedido', { token: 'T', id: 1 }))
    assert.equal(estado.items[0].ofertas[0].fechaFinVenta, '2026-12-08T03:00:00')
    assert.equal(estado.items[0].imagenes.length, 1)
  })
  test('el error de borrar queda en ese evento y no en los demás', () => {
    const estado = eventosReducer(conEventos(), eliminarEvento.rejected(null, 'pedido', { token: 'T', id: 1 }, 'El evento tiene tipos de entrada asociados'))
    assert.equal(estado.items[0].errorEdicion, 'El evento tiene tipos de entrada asociados')
    assert.equal(estado.items[1].errorEdicion, undefined)
    const borrado = eventosReducer(conEventos(), eliminarEvento.fulfilled(2, 'pedido', { token: 'T', id: 2 }))
    assert.deepEqual(borrado.items.map((evento) => evento.id), [1])
    assert.deepEqual(borrado.todos, [1])
  })
  test('cada foto es su acción: la subida marca el evento y el cambio reemplaza solo esa foto', () => {
    const subiendo = eventosReducer(conEventos(), subirImagen.pending('pedido', { token: 'T', eventoId: 1 }))
    assert.equal(subiendo.items[0].guardandoFotos, true)
    const estado = eventosReducer(subiendo, cambiarImagen.fulfilled(
      { id: 10, tipoImagenEvento: 'GALERIA', orden: 2 }, 'pedido', { token: 'T', eventoId: 1, imagenId: 10 }))
    assert.deepEqual(estado.items[0].imagenes, [{ id: 10, tipoImagenEvento: 'GALERIA', orden: 2 }])
    assert.equal(estado.items[0].guardandoFotos, false)
  })
  test('una entrada nueva se suma a su evento y el precio más alto se vuelve a pedir', () => {
    const estado = eventosReducer(conEventos({ rangoPrecios: 9000 }), crearOferta.fulfilled({ id: 21 }, 'pedido', { token: 'T', eventoId: 2 }))
    assert.deepEqual(estado.items[1].ofertas, [{ id: 21 }])
    assert.equal(estado.rangoPrecios, null)
  })
})

describe('locaciones del admin', () => {
  const conLocaciones = () => ({
    ...locacionesReducer(undefined, { type: 'inicio' }),
    items: [{ id: 1, nombre: 'Palacio', imagenes: [] }],
    cargado: true,
  })
  test('una locación nueva llega sin fotos para que no se pidan', () => {
    const estado = locacionesReducer(conLocaciones(), crearLocacion.fulfilled({ id: 2, nombre: 'Club' }, 'pedido', { token: 'T' }))
    assert.deepEqual(estado.items[1], { id: 2, nombre: 'Club', imagenes: [] })
  })
  test('si el back no deja borrarla, el error queda en esa locación y el inicio no lo ve como error de carga', () => {
    const estado = locacionesReducer(conLocaciones(), eliminarLocacion.rejected(null, 'pedido', { token: 'T', id: 1 }, 'Está en uso'))
    assert.equal(estado.items[0].errorEdicion, 'Está en uso')
    assert.equal(estado.error, null)
  })
})
