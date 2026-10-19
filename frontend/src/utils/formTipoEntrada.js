export const tipoVacio = { nombre: '', descripcion: '', activo: 'true' }

// De un tipo que devolvió el back a los datos que maneja el formulario (todo texto, como los campos).
export const tipoAFormulario = (tipo) => ({
  nombre: tipo.nombre || '',
  descripcion: tipo.descripcionBase || '',
  activo: String(tipo.activo !== false),
})

// Devuelve el primer problema que encuentra, o '' si está todo bien. El back vuelve a validar (y rechaza nombres repetidos).
export function validarTipo(datos) {
  if (!datos.nombre.trim()) return 'Escribí el nombre del tipo de entrada.'
  if (!datos.descripcion.trim()) return 'Escribí una descripción (por ejemplo, qué incluye).'
  return ''
}
