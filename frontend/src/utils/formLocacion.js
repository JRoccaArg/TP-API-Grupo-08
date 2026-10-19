export const locacionVacia = { nombre: '', direccion: '' }

// De una locación que devolvió el back a los datos que maneja el formulario.
export const locacionAFormulario = (locacion) => ({
  nombre: locacion.nombre || '',
  direccion: locacion.direccion || '',
})

// Devuelve el primer problema que encuentra, o '' si está todo bien. El back vuelve a validar (y rechaza nombres repetidos).
export function validarLocacion(datos) {
  if (!datos.nombre.trim()) return 'Escribí el nombre del lugar.'
  if (!datos.direccion.trim()) return 'Escribí la dirección del lugar.'
  return ''
}
