import { paraInput } from './fechas.js'

export const formularioVacio = {
  titulo: '', descripcion: '', estado: 'BORRADOR', inicio: '', fin: '', locacionId: '', categoriaId: '',
}

// De un evento que devolvió el back a los datos que maneja el formulario (todo texto, como los campos).
export const eventoAFormulario = (evento) => ({
  titulo: evento.titulo || '',
  descripcion: evento.descripcion || '',
  estado: evento.estado || 'BORRADOR',
  inicio: evento.fechaHoraInicio ? paraInput(evento.fechaHoraInicio) : '',
  fin: evento.fechaHoraFin ? paraInput(evento.fechaHoraFin) : '',
  locacionId: evento.locacionId ? String(evento.locacionId) : '',
  categoriaId: evento.categoriaId ? String(evento.categoriaId) : '',
})

// Devuelve el primer problema que encuentra, o '' si está todo bien. El back vuelve a validar.
export function validarEvento(datos) {
  if (!datos.titulo.trim()) return 'Escribí el título del evento.'
  if (!datos.inicio || !datos.fin) return 'Elegí la fecha y la hora de inicio y de fin.'
  if (datos.fin <= datos.inicio) return 'El fin tiene que ser posterior al inicio.'
  if (!datos.locacionId) return 'Elegí el lugar del evento.'
  if (!datos.categoriaId) return 'Elegí la categoría del evento.'
  return ''
}
