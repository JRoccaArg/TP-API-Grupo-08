import { afterEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { buscarPorNombre, esNuevo, formularioVacio, validarEvento } from '../src/utils/formEvento.js'
import { guardarEvento } from '../src/utils/guardarEvento.js'

const locaciones = [{ id: '1', nombre: 'Palacio Balcarce', direccion: 'Av. Quintana 161' }]
const categorias = [{ id: '3', nombre: 'Fiesta', activo: true }, { id: '4', nombre: 'Recital', activo: false }]
const opciones = { locaciones, categorias }
const datos = (cambios) => ({
  ...formularioVacio, titulo: 'After Palace', inicio: '2026-10-24T23:00', fin: '2026-10-25T05:00', ...cambios,
})

describe('lugar y categoría escritos a mano', () => {
  test('un nombre existente se reconoce sin importar mayúsculas ni espacios', () => {
    assert.equal(buscarPorNombre(locaciones, '  palacio   BALCARCE ').id, '1')
    assert.equal(esNuevo(locaciones, 'Palacio Balcarce'), false)
    assert.equal(esNuevo(locaciones, 'Círculo Italiano'), true)
    assert.equal(esNuevo(locaciones, '   '), false)
  })
  test('un lugar nuevo pide dirección y uno existente no', () => {
    assert.match(validarEvento(datos({ lugar: 'Círculo Italiano', categoria: 'Fiesta' }), opciones), /lugar nuevo/)
    assert.equal(validarEvento(datos({ lugar: 'Círculo Italiano', direccion: 'Libertad 1264', categoria: 'Fiesta' }), opciones), '')
    assert.equal(validarEvento(datos({ lugar: 'palacio balcarce', categoria: 'fiesta' }), opciones), '')
  })
  test('faltan lugar o categoría, o la categoría está inactiva', () => {
    assert.match(validarEvento(datos({ categoria: 'Fiesta' }), opciones), /lugar/)
    assert.match(validarEvento(datos({ lugar: 'Palacio Balcarce' }), opciones), /categoría/)
    assert.match(validarEvento(datos({ lugar: 'Palacio Balcarce', categoria: 'Recital' }), opciones), /inactiva/)
  })
})

describe('guardar un evento creando lo que falte', () => {
  const fetchOriginal = globalThis.fetch
  afterEach(() => { globalThis.fetch = fetchOriginal })
  const json = (cuerpo, estado = 200) => new Response(JSON.stringify(cuerpo), { status: estado, headers: { 'Content-Type': 'application/json' } })
  function simular(respuestas) {
    const llamadas = []
    globalThis.fetch = async (ruta, opcionesFetch = {}) => {
      const metodo = opcionesFetch.method || 'GET'
      llamadas.push({ metodo, ruta, cuerpo: opcionesFetch.body ? JSON.parse(opcionesFetch.body) : undefined })
      return respuestas(metodo, ruta)
    }
    return llamadas
  }
  const enviar = (recibidos) => (conIds) => { recibidos.push(conIds); return Promise.resolve({ id: 99 }) }

  test('si el lugar y la categoría existen, no crea nada y usa sus ids', async () => {
    const llamadas = simular(() => json({}))
    const recibidos = []
    await guardarEvento('T', datos({ lugar: 'palacio balcarce', categoria: 'Fiesta' }), opciones, enviar(recibidos))
    assert.equal(llamadas.length, 0)
    assert.equal(recibidos[0].locacionId, '1')
    assert.equal(recibidos[0].categoriaId, '3')
  })
  test('si son nuevos, los crea primero y suma lo creado a las listas', async () => {
    const llamadas = simular((metodo, ruta) =>
      ruta.endsWith('/locaciones') ? json({ id: 7, nombre: 'Círculo Italiano' }, 201) : json({ id: 8, nombre: 'After', activo: true }, 201))
    const recibidos = []
    const { evento, opciones: nuevas } = await guardarEvento(
      'T', datos({ lugar: 'Círculo Italiano', direccion: 'Libertad 1264', categoria: 'After' }), opciones, enviar(recibidos))
    assert.deepEqual(llamadas.map((l) => `${l.metodo} ${l.ruta}`), ['POST /api/locaciones', 'POST /api/categories'])
    assert.deepEqual(llamadas[0].cuerpo, { nombre: 'Círculo Italiano', direccion: 'Libertad 1264' })
    assert.deepEqual(llamadas[1].cuerpo, { nombre: 'After', activo: true })
    assert.equal(recibidos[0].locacionId, '7')
    assert.equal(recibidos[0].categoriaId, '8')
    assert.equal(evento.id, 99)
    assert.equal(nuevas.locaciones.length, 2)
    assert.equal(nuevas.categorias.length, 3)
  })
  test('si el back dice que ya existe (409), busca el que existe y lo usa', async () => {
    simular((metodo) => {
      if (metodo === 'POST') return json({ message: 'La categoria que se intenta agregar esta duplicada' }, 409)
      return json({ content: [{ id: 5, nombre: 'After', activo: true }], totalPages: 1, number: 0 })
    })
    const recibidos = []
    await guardarEvento('T', datos({ lugar: 'Palacio Balcarce', categoria: 'after' }), opciones, enviar(recibidos))
    assert.equal(recibidos[0].categoriaId, '5')
  })
  test('si crear falla por otro motivo, no se guarda el evento', async () => {
    simular(() => json({ message: 'Los datos de la locacion son invalidos' }, 400))
    const recibidos = []
    await assert.rejects(guardarEvento('T', datos({ lugar: 'X', direccion: 'Y', categoria: 'Fiesta' }), opciones, enviar(recibidos)), /invalidos/)
    assert.equal(recibidos.length, 0)
  })
})
