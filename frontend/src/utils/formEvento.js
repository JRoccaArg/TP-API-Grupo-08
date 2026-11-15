import { paraInput } from './fechas.js'

// El lugar y la categoría se eligen de una lista. Si no están, se crean con su propio botón «Crear» y quedan elegidos solos:
// el formulario guarda el nombre y lo encuentra en la lista apenas llega al store.
// "direccion" solo se pide para crear un lugar nuevo, porque el back no crea una locación sin dirección.
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
  if (esNuevo(locaciones, datos.lugar)) return `Tocá «Crear lugar» para crear "${datos.lugar.trim()}" antes de guardar el evento.`
  if (!datos.categoria.trim()) return 'Elegí la categoría del evento (o creá una nueva).'
  if (esNuevo(categorias, datos.categoria)) return `Tocá «Crear categoría» para crear "${datos.categoria.trim()}" antes de guardar el evento.`
  const categoria = buscarPorNombre(categorias, datos.categoria)
  if (categoria.activo === false) return `La categoría "${categoria.nombre}" está inactiva: activala en Categorías o elegí otra.`
  return ''
}

// Lo que espera el back al crear o editar un evento. Las fechas van como "2026-11-15T23:00:00": hora de Buenos Aires, sin zona.
export const formularioAEvento = (datos, { locaciones, categorias }) => ({
  titulo: datos.titulo.trim(),
  descripcion: datos.descripcion.trim(),
  estado: datos.estado,
  locacion_id: buscarPorNombre(locaciones, datos.lugar).id,
  categoria_id: buscarPorNombre(categorias, datos.categoria).id,
  fechaHoraInicio: `${datos.inicio}:00`,
  fechaHoraFin: `${datos.fin}:00`,
})
