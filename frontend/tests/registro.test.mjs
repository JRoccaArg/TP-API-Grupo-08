import { test } from 'node:test'
import assert from 'node:assert/strict'
import { edadEn, validarRegistro } from '../src/utils/registro.js'

const HOY = new Date('2026-10-20T12:00:00')
const datos = (cambios = {}) => ({ firstname: 'Lucía', lastname: 'Pérez', dni: '40123456', fechaNacimiento: '1998-05-10', ...cambios })

test('la edad se cuenta en años cumplidos', () => {
  assert.equal(edadEn('2008-10-20', HOY), 18)
  assert.equal(edadEn('2008-10-21', HOY), 17)
  assert.equal(edadEn('2026-10-21', HOY), -1)
  assert.equal(edadEn('', HOY), null)
})

test('un registro correcto no tiene problemas', () => {
  assert.equal(validarRegistro(datos(), HOY), '')
  assert.equal(validarRegistro(datos({ dni: '1234567' }), HOY), '')
})

test('dice cuál dato está mal', () => {
  assert.match(validarRegistro(datos({ firstname: '   ' }), HOY), /nombre/)
  assert.match(validarRegistro(datos({ lastname: 'x'.repeat(101) }), HOY), /apellido/)
  for (const dni of ['abc', '123456', '123456789', '12.345.678', '']) assert.match(validarRegistro(datos({ dni }), HOY), /DNI/, dni)
  assert.match(validarRegistro(datos({ fechaNacimiento: '' }), HOY), /fecha de nacimiento/)
  assert.match(validarRegistro(datos({ fechaNacimiento: '2999-01-01' }), HOY), /fecha de nacimiento/)
  assert.match(validarRegistro(datos({ fechaNacimiento: '1800-01-01' }), HOY), /fecha de nacimiento/)
  assert.match(validarRegistro(datos({ fechaNacimiento: '2015-01-01' }), HOY), /mayor de 18/)
})
