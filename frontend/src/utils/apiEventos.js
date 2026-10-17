import { ajustarSeleccion } from './eventos.js'

// Todas las consultas de este módulo son GET públicos; no usan la sesión ni el carrito.
const API_BASE = (import.meta.env?.VITE_API_URL || '/api').replace(/\/$/, '')
const TAMANO_PAGINA = 100

export class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje)
    this.estado = estado
  }
}

export const urlApi = (ruta) => `${API_BASE}${ruta}`

export function consultar(ruta, signal) {
  return fetch(urlApi(ruta), { signal, headers: { Accept: 'application/json' } })
    .then((respuesta) => respuesta.text().then((texto) => {
      let datos
      try { datos = JSON.parse(texto) } catch { /* Puede haber un error del proxy sin JSON. */ }
      if (!respuesta.ok) {
        throw new ErrorApi(datos?.message || 'No pudimos consultar el servidor. Intentá nuevamente.', respuesta.status)
      }
      if (datos === undefined) throw new ErrorApi('El servidor no devolvió los datos esperados.')
      return datos
    }))
    .catch((error) => {
      if (error.name === 'AbortError' || error instanceof ErrorApi) throw error
      throw new ErrorApi('No pudimos conectarnos. Revisá tu conexión e intentá nuevamente.')
    })
}

// También las entradas y las imágenes están paginadas. No se descarta ninguna página.
export function consultarPaginas(ruta, signal) {
  const pagina = (numero) => consultar(`${ruta}?page=${numero}&size=${TAMANO_PAGINA}`, signal)
    .then((datos) => {
      if (!datos || !Array.isArray(datos.content) || !Number.isInteger(datos.totalPages) || datos.totalPages < 0) {
        throw new ErrorApi('El listado recibido tiene un formato inesperado.')
      }
      if (numero + 1 >= datos.totalPages) return datos.content
      return pagina(numero + 1).then((siguientes) => [...datos.content, ...siguientes])
    })
  return pagina(0).then((datos) => [...new Map(datos.map((dato) => [dato.id, dato])).values()])
}

const recuperar = (error) => {
  if (error.name === 'AbortError') throw error
  return { error: error.message }
}

export const obtenerOfertas = (id, signal) =>
  consultarPaginas(`/eventosTiposEntrada/evento/${id}`, signal)

function obtenerImagenes(id, signal) {
  return consultarPaginas(`/eventos/${id}/imagenes`, signal).then((imagenes) =>
    imagenes.map((imagen) => ({
      ...imagen, url: urlApi(`/eventos/${id}/imagenes/${imagen.id}/archivo`),
    })).sort((a, b) =>
      Number(b.tipoImagenEvento === 'PORTADA') - Number(a.tipoImagenEvento === 'PORTADA') ||
      (a.orden ?? 0) - (b.orden ?? 0) || a.id - b.id))
}

function completarEvento(evento, signal) {
  return Promise.all([
    obtenerOfertas(evento.id, signal).catch(recuperar),
    obtenerImagenes(evento.id, signal).catch(recuperar),
  ]).then(([ofertas, imagenes]) => ({
    ...evento,
    ofertas: ofertas.error ? [] : ofertas,
    imagenes: imagenes.error ? [] : imagenes,
    errorOfertas: ofertas.error || '',
    errorImagenes: imagenes.error || '',
  }))
}

export const obtenerEvento = (id, signal) =>
  consultar(`/eventos/${id}`, signal).then((evento) => completarEvento(evento, signal))

// Lotes de cuatro evitan disparar cientos de solicitudes simultáneas.
function completarLotes(eventos, signal) {
  if (!eventos.length) return Promise.resolve([])
  return Promise.all(eventos.slice(0, 4).map((evento) => completarEvento(evento, signal)))
    .then((lote) => completarLotes(eventos.slice(4), signal).then((resto) => [...lote, ...resto]))
}

export function obtenerCatalogo(signal) {
  return consultarPaginas('/eventos', signal)
    .then((eventos) => eventos.filter((evento) => evento.estado?.toUpperCase() !== 'BORRADOR'))
    .then((eventos) => completarLotes(eventos, signal))
    .then((eventos) => eventos.sort((a, b) =>
      Number(b.estado?.toUpperCase() === 'ACTIVO') - Number(a.estado?.toUpperCase() === 'ACTIVO') || a.id - b.id))
}

export function verificarSeleccion(evento, seleccion, signal) {
  return Promise.all([
    obtenerEvento(evento.id, signal),
    Promise.all(seleccion.map((item) => consultar(
      `/eventosTiposEntrada/${item.ofertaId}/disponibilidad?cantidad=${item.cantidad}`, signal))),
  ]).then(([actualizado, disponibilidades]) => {
    const nueva = actualizado.errorOfertas ? [] : ajustarSeleccion(seleccion, actualizado.ofertas, actualizado)
    const cambiaronPrecios = nueva.some((item) =>
      actualizado.ofertas.find((oferta) => oferta.id === item.ofertaId)?.precioFinal !==
      evento.ofertas.find((oferta) => oferta.id === item.ofertaId)?.precioFinal)
    return {
      evento: actualizado, seleccion: nueva,
      cambio: disponibilidades.some((disponible) => disponible !== true) ||
        JSON.stringify(nueva) !== JSON.stringify(seleccion) || cambiaronPrecios,
    }
  })
}
