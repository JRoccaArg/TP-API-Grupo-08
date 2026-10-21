export const tipoVacio = { nombre: '', descripcion: '', activo: 'true' }

export const tipoAFormulario = (tipo) => ({
  nombre: tipo.nombre || '',
  descripcion: tipo.descripcionBase || '',
  activo: String(tipo.activo !== false),
})

export function validarTipo(datos) {
  if (!datos.nombre.trim()) return 'Escribí el nombre del tipo de entrada.'
  if (!datos.descripcion.trim()) return 'Escribí una descripción (por ejemplo, qué incluye).'
  return ''
}
