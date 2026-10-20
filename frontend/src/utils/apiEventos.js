import { ajustarSeleccion } from './eventos.js'
import { normalizarImporteFiltro } from './filtrosCatalogo.js'

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

export function consultar(ruta) {
  return fetch(urlApi(ruta), { headers: { Accept: 'application/json' } })
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
      if (error instanceof ErrorApi) throw error
      throw new ErrorApi('No pudimos conectarnos. Revisá tu conexión e intentá nuevamente.')
    })
}

// También las entradas y las imágenes están paginadas. No se descarta ninguna página.
export function consultarPaginas(ruta) {
  const pagina = (numero) => consultar(`${ruta}?page=${numero}&size=${TAMANO_PAGINA}`)
    .then((datos) => {
      if (!datos || !Array.isArray(datos.content) || !Number.isInteger(datos.totalPages) || datos.totalPages < 0) {
        throw new ErrorApi('El listado recibido tiene un formato inesperado.')
      }
      if (numero + 1 >= datos.totalPages) return datos.content
      return pagina(numero + 1).then((siguientes) => [...datos.content, ...siguientes])
    })
  return pagina(0).then((datos) => [...new Map(datos.map((dato) => [dato.id, dato])).values()])
}

// Un pedido auxiliar que falla no tira abajo el evento: se guarda el mensaje y se muestra en pantalla.
const recuperar = (error) => ({ error: error.message })

export const obtenerOfertas = (id) => consultarPaginas(`/eventosTiposEntrada/evento/${id}`)

// Las imágenes llegan sin la ruta del archivo: se la agrega acá. La portada va primero y después, por orden.
export const urlImagen = (eventoId, imagen) => ({
  ...imagen, url: urlApi(`/eventos/${eventoId}/imagenes/${imagen.id}/archivo`),
})

export const ordenarImagenes = (imagenes) => [...imagenes].sort((a, b) =>
  Number(b.tipoImagenEvento === 'PORTADA') - Number(a.tipoImagenEvento === 'PORTADA') ||
  (a.orden ?? 0) - (b.orden ?? 0) || a.id - b.id)

export const obtenerImagenes = (id) => consultarPaginas(`/eventos/${id}/imagenes`)
  .then((imagenes) => ordenarImagenes(imagenes.map((imagen) => urlImagen(id, imagen))))

// Primero las ofertas y después las imágenes: si una de las dos falla, el evento se muestra igual.
function completarEvento(evento) {
  return obtenerOfertas(evento.id).catch(recuperar).then((ofertas) =>
    obtenerImagenes(evento.id).catch(recuperar).then((imagenes) => ({
      ...evento,
      ofertas: ofertas.error ? [] : ofertas,
      imagenes: imagenes.error ? [] : imagenes,
      errorOfertas: ofertas.error || '',
      errorImagenes: imagenes.error || '',
    })))
}

export const obtenerEvento = (id) => consultar(`/eventos/${id}`).then(completarEvento)

// De a un evento por vez: no se disparan cientos de solicitudes simultáneas.
export function completarEventos(eventos) {
  if (!eventos.length) return Promise.resolve([])
  return completarEvento(eventos[0]).then((primero) =>
    completarEventos(eventos.slice(1)).then((resto) => [primero, ...resto]))
}

// El catálogo pide una sola página; las ofertas e imágenes se completan sólo para esa página.
// Cuántos eventos se muestran por página del catálogo (se pide al back y se usa para el contador "Mostrando 1–4").
export const EVENTOS_POR_PAGINA = 4

export function obtenerCatalogo({ busqueda = '', categoria = '', precioMin = '', precioMax = '', orden = 'lejanos', pagina = 1 } = {}) {
  const parametros = new URLSearchParams({ page: String(pagina - 1), size: String(EVENTOS_POR_PAGINA), catalogo: 'true' })
  if (busqueda.trim()) parametros.set('nombre', busqueda.trim())
  if (categoria) parametros.set('categoriaId', categoria)
  if (orden === 'antiguos') parametros.set('orden', orden)
  if (precioMin !== '') parametros.set('precioMin', normalizarImporteFiltro(precioMin))
  if (precioMax !== '') parametros.set('precioMax', normalizarImporteFiltro(precioMax))
  return consultar(`/eventos?${parametros}`).then((datos) => {
    if (!Array.isArray(datos?.content) || !Number.isInteger(datos.totalPages) || datos.totalPages < 0 ||
        !Number.isInteger(datos.totalElements) || datos.totalElements < 0 ||
        !Number.isInteger(datos.number) || datos.number < 0) {
      throw new ErrorApi('El listado recibido tiene un formato inesperado.')
    }
    return completarEventos(datos.content).then((content) => ({ ...datos, content }))
  })
}

export const obtenerCategorias = () => consultarPaginas('/categories')
  .then((categorias) => categorias.map((categoria) => ({ ...categoria, id: String(categoria.id) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')))

// La portada obtiene la próxima fecha global, aunque el catálogo esté filtrado o en otra página.
// Devuelve los próximos eventos activos, del más cercano al más lejano. El primero es la "próxima fecha".
export const obtenerProximos = (cantidad = 5) => consultar(`/eventos?page=0&size=${cantidad}&proximo=true`)
  .then((datos) => datos.content)

// Pregunta, de a una, si la cantidad elegida de cada entrada sigue disponible.
function consultarDisponibilidades(seleccion) {
  if (!seleccion.length) return Promise.resolve([])
  const [item, ...resto] = seleccion
  return consultar(`/eventosTiposEntrada/${item.ofertaId}/disponibilidad?cantidad=${item.cantidad}`)
    .then((disponible) => consultarDisponibilidades(resto).then((otras) => [disponible, ...otras]))
}

export function verificarSeleccion(evento, seleccion) {
  return obtenerEvento(evento.id).then((actualizado) =>
    consultarDisponibilidades(seleccion).then((disponibilidades) => {
      const nueva = actualizado.errorOfertas ? [] : ajustarSeleccion(seleccion, actualizado.ofertas, actualizado)
      const cambiaronPrecios = nueva.some((item) =>
        actualizado.ofertas.find((oferta) => oferta.id === item.ofertaId)?.precioFinal !==
        evento.ofertas.find((oferta) => oferta.id === item.ofertaId)?.precioFinal)
      return {
        evento: actualizado, seleccion: nueva,
        cambio: disponibilidades.some((disponible) => disponible !== true) ||
          JSON.stringify(nueva) !== JSON.stringify(seleccion) || cambiaronPrecios,
      }
    }))
}

// Un evento con sus imágenes, sin sus entradas: alcanza para mostrarlo en el carrito (flyer, fecha y lugar).
export const obtenerEventoConImagenes = (id) => consultar(`/eventos/${id}`).then((evento) =>
  obtenerImagenes(id).catch(() => []).then((imagenes) => ({ ...evento, imagenes })))

// Los eventos de varios ids, de a uno: { id: evento }. Si uno no se puede pedir queda en null y se muestra sin flyer.
export function obtenerEventosPorId(ids) {
  if (!ids.length) return Promise.resolve({})
  const [id, ...resto] = ids
  return obtenerEventoConImagenes(id).catch(() => null).then((evento) =>
    obtenerEventosPorId(resto).then((otros) => ({ [id]: evento, ...otros })))
}
