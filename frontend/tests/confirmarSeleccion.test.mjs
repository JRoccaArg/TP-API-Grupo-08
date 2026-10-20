import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { confirmarSeleccion } from '../src/utils/confirmarSeleccion.js'

const fetchOriginal = globalThis.fetch
afterEach(() => { globalThis.fetch = fetchOriginal })

const json = (datos) => new Response(JSON.stringify(datos), { status: 200, headers: { 'Content-Type': 'application/json' } })
const oferta = (cambios = {}) => ({ id: 7, estado: 'ACTIVO', cantidadDisponible: 10, precioFinal: 9, ...cambios })
const evento = (ofertas) => ({ id: 1, titulo: 'Evento 1', estado: 'ACTIVO', ofertas })

// El back responde con las ofertas que se le pasan; la disponibilidad responde "disponible".
function simularBack(ofertasDelBack, disponible = true) {
  globalThis.fetch = async (ruta) => {
    const url = new URL(ruta, 'http://frontend.test')
    if (url.pathname === '/api/eventos/1') return json({ id: 1, titulo: 'Evento 1', estado: 'ACTIVO' })
    if (url.pathname.endsWith('/imagenes')) return json({ content: [], totalPages: 0 })
    if (url.pathname.endsWith('/disponibilidad')) return json(disponible)
    return json({ content: ofertasDelBack, totalPages: 1 })
  }
}

test('si nada cambió, entrega las entradas al carrito y devuelve el evento sin el stock apartado', async () => {
  simularBack([oferta()])
  const pedidos = []
  const resultado = await confirmarSeleccion(evento([oferta()]), [{ ofertaId: 7, cantidad: 3 }], (pedido) => {
    pedidos.push(pedido)
    return Promise.resolve()
  })
  assert.deepEqual(pedidos, [{ eventoId: 1, items: [{ eventoTipoEntradaId: 7, cantidad: 3 }] }])
  assert.equal(resultado.cambio, false)
  assert.deepEqual(resultado.seleccion, [])
  assert.equal(resultado.evento.ofertas[0].cantidadDisponible, 7)
})

test('si cambió la disponibilidad o el precio, no agrega nada y devuelve lo actualizado', async () => {
  simularBack([oferta({ cantidadDisponible: 2 })], false)
  const resultado = await confirmarSeleccion(evento([oferta()]), [{ ofertaId: 7, cantidad: 4 }], () => {
    throw new Error('no debía agregar')
  })
  assert.equal(resultado.cambio, true)
  assert.deepEqual(resultado.seleccion, [{ ofertaId: 7, cantidad: 2 }])
})

test('si falla el agregado, el error conserva cuántas entraron y lo verificado', async () => {
  simularBack([oferta()])
  const fallo = Object.assign(new Error('Sin stock'), { agregados: 1 })
  await assert.rejects(
    confirmarSeleccion(evento([oferta()]), [{ ofertaId: 7, cantidad: 3 }], () => Promise.reject(fallo)),
    (error) => error === fallo && error.agregados === 1 && error.actual.cambio === false && error.actual.evento.id === 1,
  )
})
