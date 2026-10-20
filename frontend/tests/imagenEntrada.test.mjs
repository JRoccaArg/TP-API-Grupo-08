import test from 'node:test'
import assert from 'node:assert/strict'
import { compartirImagen, nombreArchivo } from '../src/utils/imagenEntrada.js'

test('el archivo descargado se llama con el evento (sin tildes ni espacios) y el código corto', () => {
  assert.equal(nombreArchivo('Noche Italiana', 'e1fb0301-2eb3-42bf'), 'zenoir-noche-italiana-e1fb0301.png')
  assert.equal(nombreArchivo('After Palace: Edición ÚNICA', 'abcdef12-xyz'), 'zenoir-after-palace-edicion-unica-abcdef12.png')
})
test('si el navegador no puede compartir, avisa que se descargue', async () => {
  assert.match(await compartirImagen('data:image/png;base64,AA', 'a.png', 'Mi entrada'), /descargá la entrada/)
})
