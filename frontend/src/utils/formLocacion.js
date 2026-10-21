export const locacionVacia = { nombre: '', direccion: '' }

export const locacionAFormulario = (locacion) => ({
  nombre: locacion.nombre || '',
  direccion: locacion.direccion || '',
})

export function validarLocacion(datos) {
  if (!datos.nombre.trim()) return 'Escribí el nombre del lugar.'
  if (!datos.direccion.trim()) return 'Escribí la dirección del lugar.'
  return ''
}
