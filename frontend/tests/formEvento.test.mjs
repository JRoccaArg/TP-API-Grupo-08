import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { buscarPorNombre, esNuevo, formularioAEvento, formularioVacio, validarEvento } from '../src/utils/formEvento.js'

const locaciones = [{ id: 1, nombre: 'Palacio Balcarce', direccion: 'Av. Quintana 161' }]
const categorias = [{ id: 3, nombre: 'Fiesta', activo: true }, { id: 4, nombre: 'Recital', activo: false }]
const opciones = { locaciones, categorias }
const datos = (cambios) => ({
  ...formularioVacio, titulo: 'After Palace', inicio: '2026-10-24T23:00', fin: '2026-10-25T05:00', ...cambios,
})

describe('lugar y categoría del formulario del evento', () => {
  test('un nombre existente se reconoce sin importar mayúsculas ni espacios', () => {
    assert.equal(buscarPorNombre(locaciones, '  palacio   BALCARCE ').id, 1)
    assert.equal(esNuevo(locaciones, 'Palacio Balcarce'), false)
    assert.equal(esNuevo(locaciones, 'Círculo Italiano'), true)
    assert.equal(esNuevo(locaciones, '   '), false)
  })
  test('lo que no está en la lista se crea antes con su botón, no al guardar el evento', () => {
    assert.match(validarEvento(datos({ lugar: 'Círculo Italiano', categoria: 'Fiesta' }), opciones), /Crear lugar/)
    assert.match(validarEvento(datos({ lugar: 'Palacio Balcarce', categoria: 'After' }), opciones), /Crear categoría/)
    assert.equal(validarEvento(datos({ lugar: 'palacio balcarce', categoria: 'fiesta' }), opciones), '')
  })
  test('faltan lugar o categoría, o la categoría está inactiva', () => {
    assert.match(validarEvento(datos({ categoria: 'Fiesta' }), opciones), /lugar/)
    assert.match(validarEvento(datos({ lugar: 'Palacio Balcarce' }), opciones), /categoría/)
    assert.match(validarEvento(datos({ lugar: 'Palacio Balcarce', categoria: 'Recital' }), opciones), /inactiva/)
  })
  test('el evento que va al back lleva los ids de la lista y las fechas con segundos', () => {
    assert.deepEqual(formularioAEvento(datos({ lugar: 'palacio balcarce', categoria: 'FIESTA', descripcion: ' Noche ' }), opciones), {
      titulo: 'After Palace',
      descripcion: 'Noche',
      estado: 'BORRADOR',
      locacion_id: 1,
      categoria_id: 3,
      fechaHoraInicio: '2026-10-24T23:00:00',
      fechaHoraFin: '2026-10-25T05:00:00',
    })
  })
})
