import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fotosDelEvento, galeriaDelDetalle } from '../src/utils/fotos.js'

// Las fotos llegan del back sin la ruta del archivo: el <img> la pide pasando por el proxy de Vite ("/api" + la ruta del back)
const evento = {
  id: 7,
  imagenes: [
    { id: 3, tipoImagenEvento: 'GALERIA', orden: 1 },
    { id: 1, tipoImagenEvento: 'PORTADA', orden: 2 },
    { id: 2, tipoImagenEvento: 'GALERIA', orden: 1 },
  ],
}

test('las fotos del evento van con la portada primero, después por orden y, si empatan, por id', () => {
  const fotos = fotosDelEvento(evento)
  assert.deepEqual(fotos.map((foto) => foto.id), [1, 2, 3])
  assert.equal(fotos[0].url, '/api/eventos/7/imagenes/1/archivo')
})

test('un evento que todavía no tiene sus fotos en el store no rompe la pantalla', () => {
  assert.deepEqual(fotosDelEvento({ id: 7 }), [])
})

test('la galería del detalle suma al final las fotos del lugar, como fotos de galería y sin pisar los ids del evento', () => {
  const lugar = { id: 3, imagenes: [{ id: 2, orden: 2, textoAlternativo: 'Salón' }, { id: 1, orden: 1, textoAlternativo: 'Barra' }] }
  const galeria = galeriaDelDetalle(evento, lugar)
  assert.deepEqual(galeria.map((foto) => foto.id), [1, 2, 3, 'lugar-1', 'lugar-2'])
  assert.equal(galeria[3].tipoImagenEvento, 'GALERIA')
  assert.equal(galeria[3].descripcion, 'Barra')
  assert.equal(galeria[3].url, '/api/locaciones/3/imagenes/1/archivo')
})

test('si el lugar todavía no está en el store, la galería queda con las fotos del evento', () => {
  assert.deepEqual(galeriaDelDetalle(evento, undefined).map((foto) => foto.id), [1, 2, 3])
})
