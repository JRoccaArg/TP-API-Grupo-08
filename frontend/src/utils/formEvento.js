import { paraInput } from './fechas.js'

// El lugar y la categoría se eligen de una lista o se crean con un nombre nuevo: si el nombre ya existe se usa ese, si no se crea al guardar.
// "direccion" solo se pide cuando el lugar es nuevo, porque el back no crea una locación sin dirección.
export const formularioVacio = {
  titulo: '', descripcion: '', estado: 'BORRADOR', inicio: '', fin: '', lugar: '', direccion: '', categoria: '',
}

export const eventoAFormulario = (evento) => ({
  titulo: evento.titulo || '',
  descripcion: evento.descripcion || '',
  estado: evento.estado || 'BORRADOR',
  inicio: evento.fechaHoraInicio ? paraInput(evento.fechaHoraInicio) : '',
  fin: evento.fechaHoraFin ? paraInput(evento.fechaHoraFin) : '',
  lugar: evento.locacionNombre || '',
  direccion: '',
  categoria: evento.categoriaNombre || '',
})

// Busca por nombre sin importar mayúsculas ni espacios de más: "palacio balcarce " es "Palacio Balcarce".
const normalizar = (texto) => texto.trim().replace(/\s+/g, ' ').toLowerCase()
export const buscarPorNombre = (lista, nombre) => lista.find((item) => normalizar(item.nombre) === normalizar(nombre))

export const esNuevo = (lista, nombre) => nombre.trim() !== '' && !buscarPorNombre(lista, nombre)

// Devuelve el primer problema que encuentra, o '' si está todo bien. El back vuelve a validar.
export function validarEvento(datos, { locaciones, categorias }) {
  if (!datos.titulo.trim()) return 'Escribí el título del evento.'
  if (!datos.inicio || !datos.fin) return 'Elegí la fecha y la hora de inicio y de fin.'
  if (datos.fin <= datos.inicio) return 'El fin tiene que ser posterior al inicio.'
  if (!datos.lugar.trim()) return 'Elegí el lugar del evento (o creá uno nuevo).'
  if (esNuevo(locaciones, datos.lugar) && !datos.direccion.trim()) return `"${datos.lugar.trim()}" es un lugar nuevo: escribí su dirección.`
  if (!datos.categoria.trim()) return 'Elegí la categoría del evento (o creá una nueva).'
  const categoria = buscarPorNombre(categorias, datos.categoria)
  if (categoria?.activo === false) return `La categoría "${categoria.nombre}" está inactiva: activala en Categorías o elegí otra.`
  return ''
}
