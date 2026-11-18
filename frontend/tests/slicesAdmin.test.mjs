import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import eventosReducer, {
  actualizarEvento, actualizarOferta, cambiarImagen, crearEvento, crearOferta, eliminarEvento, eliminarOferta, subirImagen,
} from '../src/redux/eventosSlice.js'
import locacionesReducer, { actualizarLocacion, crearLocacion, eliminarLocacion } from '../src/redux/locacionesSlice.js'

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
  test('crear un borrador lo suma sin entradas ni fotos (así no se piden) y no toca el catálogo, donde no sale', () => {
    const estado = eventosReducer(conEventos(), crearEvento.fulfilled({ id: 3, titulo: 'Nuevo', estado: 'BORRADOR' }, 'pedido', { token: 'T' }))
    assert.deepEqual(estado.items[2], { id: 3, titulo: 'Nuevo', estado: 'BORRADOR', ofertas: [], imagenes: [] })
    assert.deepEqual(estado.todos, [1, 2, 3])
    assert.deepEqual(estado.paginas, [{ consulta: 'page=0', ids: [1, 2] }])
    assert.deepEqual(estado.proximos, [{ id: 1 }])
  })
  test('crear un evento publicado vacía las páginas: en cuál va lo decide el back', () => {
    const estado = eventosReducer(conEventos(), crearEvento.fulfilled({ id: 3, titulo: 'Nuevo', estado: 'ACTIVO' }, 'pedido', { token: 'T' }))
    assert.deepEqual(estado.paginas, [])
    assert.equal(estado.proximos, null)
  })
  test('editar no vacía el catálogo: el evento se actualiza en items y en los próximos, y se ve en el momento', () => {
    const estado = eventosReducer(conEventos(), actualizarEvento.fulfilled({ id: 1, titulo: 'Gala Nueva' }, 'pedido', { token: 'T', id: 1 }))
    assert.equal(estado.items[0].titulo, 'Gala Nueva')
    assert.deepEqual(estado.paginas, [{ consulta: 'page=0', ids: [1, 2] }])
    assert.deepEqual(estado.proximos, [{ id: 1, titulo: 'Gala Nueva' }])
  })
  test('publicar un borrador vacía las páginas; pasar un evento a borrador lo saca del catálogo', () => {
    const conBorrador = conEventos()
    conBorrador.items[1] = { ...conBorrador.items[1], estado: 'BORRADOR' }
    const publicado = eventosReducer(conBorrador, actualizarEvento.fulfilled({ id: 2, estado: 'ACTIVO' }, 'pedido', { token: 'T', id: 2 }))
    assert.deepEqual(publicado.paginas, [])
    assert.equal(publicado.proximos, null)
    const despublicado = eventosReducer(conEventos(), actualizarEvento.fulfilled({ id: 1, estado: 'BORRADOR' }, 'pedido', { token: 'T', id: 1 }))
    assert.deepEqual(despublicado.paginas[0].ids, [2])
    assert.deepEqual(despublicado.proximos, [])
  })
  test('borrar saca el evento de las páginas y de los próximos con filter, sin pedir nada', () => {
    const estado = eventosReducer(conEventos(), eliminarEvento.fulfilled(1, 'pedido', { token: 'T', id: 1 }))
    assert.deepEqual(estado.paginas[0].ids, [2])
    assert.deepEqual(estado.proximos, [])
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
  test('el error de un alta fallida se borra cuando se guarda o se borra otro evento (se resetea en el pending)', () => {
    const fallo = eventosReducer(conEventos(), crearEvento.rejected(null, 'pedido', { token: 'T' }, 'Ya existe un evento con ese título'))
    assert.equal(fallo.errorAdmin, 'Ya existe un evento con ese título')
    assert.equal(eventosReducer(fallo, actualizarEvento.pending('pedido', { token: 'T', id: 1 })).errorAdmin, null)
    assert.equal(eventosReducer(fallo, eliminarEvento.pending('pedido', { token: 'T', id: 2 })).errorAdmin, null)
  })
  test('cada foto es su acción: la subida marca el evento y el cambio reemplaza solo esa foto', () => {
    const subiendo = eventosReducer(conEventos(), subirImagen.pending('pedido', { token: 'T', eventoId: 1 }))
    assert.equal(subiendo.items[0].guardandoFotos, true)
    const estado = eventosReducer(subiendo, cambiarImagen.fulfilled(
      { id: 10, tipoImagenEvento: 'GALERIA', orden: 2 }, 'pedido', { token: 'T', eventoId: 1, imagenId: 10 }))
    assert.deepEqual(estado.items[0].imagenes, [{ id: 10, tipoImagenEvento: 'GALERIA', orden: 2 }])
    assert.equal(estado.items[0].guardandoFotos, false)
  })
  test('una entrada nueva se suma a su evento y, si es más cara, sube el máximo del filtro; el catálogo no se vacía', () => {
    const inicio = conEventos({ rangoPrecios: 9000 })
    const cara = eventosReducer(inicio, crearOferta.fulfilled({ id: 21, precioFinal: 12000 }, 'pedido', { token: 'T', eventoId: 2 }))
    assert.deepEqual(cara.items[1].ofertas, [{ id: 21, precioFinal: 12000 }])
    assert.equal(cara.rangoPrecios, 12000)
    assert.deepEqual(cara.paginas, [{ consulta: 'page=0', ids: [1, 2] }])
    const barata = eventosReducer(cara, crearOferta.fulfilled({ id: 22, precioFinal: 5000 }, 'pedido', { token: 'T', eventoId: 2 }))
    assert.equal(barata.rangoPrecios, 12000)
  })
  test('las ventas del resumen se actualizan con la respuesta de cada entrada (agregar, editar y quitar), sin volver a pedirlas', () => {
    const general = { id: 21, tipoEntradaNombre: 'General', estado: 'ACTIVO', cantidadTotal: 100, cantidadDisponible: 100, precioFinal: 1000 }
    const inicio = conEventos({ estadisticas: { eventoId: 2, vendidas: 0, cupoTotal: 0, recaudado: 0, compras: 0, ingresados: 0, porEntrada: [] } })
    const creada = eventosReducer(inicio, crearOferta.fulfilled(general, 'pedido', { token: 'T', eventoId: 2 }))
    assert.equal(creada.estadisticas.cupoTotal, 100)
    assert.deepEqual(creada.estadisticas.porEntrada, [{
      eventoTipoEntradaId: 21, tipoEntradaNombre: 'General', estado: 'ACTIVO', cupo: 100, disponibles: 100, vendidas: 0, recaudado: 0,
    }])
    // Con ventas: editar cambia el cupo y deja lo vendido como estaba
    const conVentas = { ...creada, estadisticas: { ...creada.estadisticas, porEntrada: [{ ...creada.estadisticas.porEntrada[0], vendidas: 3, recaudado: 3000 }] } }
    const editada = eventosReducer(conVentas, actualizarOferta.fulfilled(
      { ...general, cantidadTotal: 150, cantidadDisponible: 147 }, 'pedido', { token: 'T', eventoId: 2, id: 21 }))
    assert.equal(editada.estadisticas.cupoTotal, 150)
    assert.deepEqual(editada.estadisticas.porEntrada[0], {
      eventoTipoEntradaId: 21, tipoEntradaNombre: 'General', estado: 'ACTIVO', cupo: 150, disponibles: 147, vendidas: 3, recaudado: 3000,
    })
    const quitada = eventosReducer(creada, eliminarOferta.fulfilled(21, 'pedido', { token: 'T', eventoId: 2, id: 21 }))
    assert.equal(quitada.estadisticas.cupoTotal, 0)
    assert.deepEqual(quitada.estadisticas.porEntrada, [])
    // Las ventas de otro evento no se tocan
    const deOtro = eventosReducer(conEventos({ estadisticas: { eventoId: 1, cupoTotal: 50, porEntrada: [] } }),
      crearOferta.fulfilled(general, 'pedido', { token: 'T', eventoId: 2 }))
    assert.deepEqual(deOtro.estadisticas, { eventoId: 1, cupoTotal: 50, porEntrada: [] })
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
  test('el error de un alta fallida no queda pegado: guardar o borrar otra locación lo borra', () => {
    const fallo = locacionesReducer(conLocaciones(), crearLocacion.rejected(null, 'pedido', { token: 'T' }, 'Ya existe una locación con ese nombre'))
    assert.equal(fallo.error, 'Ya existe una locación con ese nombre')
    assert.equal(locacionesReducer(fallo, actualizarLocacion.pending('pedido', { token: 'T', id: 1 })).error, null)
    assert.equal(locacionesReducer(fallo, eliminarLocacion.pending('pedido', { token: 'T', id: 1 })).error, null)
  })
})
