import { ErrorApi, completarEventos, consultar, consultarPaginas, obtenerCategorias, obtenerEvento, urlApi } from './apiEventos.js'

// Pedidos del administrador al backend. Todos llevan el token en el encabezado "Authorization: Bearer <token>".
// "cuerpo" puede ser un objeto (se manda como JSON) o un FormData (se manda como formulario con archivos).
function pedir(metodo, ruta, token, cuerpo) {
  const cabeceras = { Accept: 'application/json', Authorization: `Bearer ${token}` }
  const opciones = { method: metodo, headers: cabeceras }
  if (cuerpo instanceof FormData) {
    opciones.body = cuerpo // el navegador agrega solo el Content-Type (con el separador de las partes)
  } else if (cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json'
    opciones.body = JSON.stringify(cuerpo)
  }
  return fetch(urlApi(ruta), opciones)
    .then((respuesta) => respuesta.text().then((texto) => {
      let datos
      try { datos = JSON.parse(texto) } catch { /* sin cuerpo (204) o error sin JSON */ }
      if (!respuesta.ok) {
        const sinPermiso = respuesta.status === 401 || respuesta.status === 403
        throw new ErrorApi(
          sinPermiso ? 'Tu sesión venció o no tenés permiso para esto. Volvé a ingresar.'
            : datos?.message || 'No pudimos completar la operación. Intentá nuevamente.',
          respuesta.status,
        )
      }
      return datos
    }))
    .catch((error) => {
      if (error instanceof ErrorApi) throw error
      throw new ErrorApi('No pudimos conectarnos. Revisá tu conexión e intentá nuevamente.')
    })
}

// --- lecturas para armar las pantallas de administración ---
export const obtenerLocaciones = () => consultarPaginas('/locaciones')

// Lo que necesitan los selects del formulario de evento: los lugares y las categorías activas.
export const cargarOpciones = () =>
  obtenerLocaciones().then((locaciones) =>
    obtenerCategorias().then((categorias) => ({
      locaciones: locaciones.map((locacion) => ({ ...locacion, id: String(locacion.id) })),
      categorias: categorias.filter((categoria) => categoria.activo !== false),
    })))

export const cargarEdicion = (id) =>
  obtenerEvento(id).then((evento) => cargarOpciones().then((opciones) => ({ evento, ...opciones })))

// Todos los eventos (cualquier estado), con sus entradas e imágenes, del más lejano al más antiguo.
export const obtenerEventosAdmin = () =>
  consultarPaginas('/eventos')
    .then(completarEventos)
    .then((lista) => lista.sort((a, b) => String(b.fechaHoraInicio).localeCompare(String(a.fechaHoraInicio))))

// --- eventos ---
// El formulario guarda las fechas como "2026-11-15T23:00" (hora de Buenos Aires, sin zona): así las espera el back.
const aSolicitud = (datos) => ({
  titulo: datos.titulo.trim(),
  descripcion: datos.descripcion.trim(),
  estado: datos.estado,
  locacion_id: Number(datos.locacionId),
  categoria_id: Number(datos.categoriaId),
  fechaHoraInicio: `${datos.inicio}:00`,
  fechaHoraFin: `${datos.fin}:00`,
})

export const crearEvento = (token, datos) => pedir('POST', '/eventos', token, aSolicitud(datos))
export const actualizarEvento = (token, id, datos) => pedir('PATCH', `/eventos/${id}`, token, aSolicitud(datos))
export const eliminarEvento = (token, id) => pedir('DELETE', `/eventos/${id}`, token)

// --- fotos del evento (el back las recibe como formulario con archivo) ---
export function subirImagen(token, eventoId, { archivo, tipo, orden, descripcion }) {
  const formulario = new FormData()
  formulario.append('archivo', archivo)
  formulario.append('tipoImagenEvento', tipo)
  formulario.append('orden', String(orden))
  formulario.append('descripcion', descripcion)
  return pedir('POST', `/eventos/${eventoId}/imagenes`, token, formulario)
}

// Solo se manda lo que cambia (tipo y/o orden); sin archivo, la foto queda igual.
export function cambiarImagen(token, eventoId, imagenId, { tipo, orden }) {
  const formulario = new FormData()
  if (tipo !== undefined) formulario.append('tipoImagenEvento', tipo)
  if (orden !== undefined) formulario.append('orden', String(orden))
  return pedir('PATCH', `/eventos/${eventoId}/imagenes/${imagenId}`, token, formulario)
}

export const eliminarImagen = (token, eventoId, imagenId) =>
  pedir('DELETE', `/eventos/${eventoId}/imagenes/${imagenId}`, token)

// --- locaciones ---
// Las fotos de una locación no tienen tipo (no hay portada): solo un orden. "descripcion" es el texto alternativo.
export const urlFotoLocacion = (locacionId, foto) => ({
  ...foto,
  descripcion: foto.textoAlternativo,
  url: urlApi(`/locaciones/${locacionId}/imagenes/${foto.id}/archivo`),
})

export const ordenarFotosLocacion = (fotos) => [...fotos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.id - b.id)

export const obtenerImagenesLocacion = (id) => consultarPaginas(`/locaciones/${id}/imagenes`)
  .then((fotos) => ordenarFotosLocacion(fotos.map((foto) => urlFotoLocacion(id, foto))))

// A cada locación se le suman sus fotos, de a una. Si las fotos de una no se pueden pedir, esa se muestra sin fotos.
function conFotos(locaciones) {
  if (!locaciones.length) return Promise.resolve([])
  const [primera, ...resto] = locaciones
  return obtenerImagenesLocacion(primera.id).catch(() => []).then((imagenes) =>
    conFotos(resto).then((otras) => [{ ...primera, imagenes }, ...otras]))
}

// Todas las locaciones con sus fotos, por orden alfabético.
export const obtenerLocacionesAdmin = () =>
  obtenerLocaciones().then(conFotos).then((lista) => lista.sort((a, b) => a.nombre.localeCompare(b.nombre)))

export const cargarLocacion = (id) =>
  consultar(`/locaciones/${id}`).then((locacion) =>
    obtenerImagenesLocacion(id).then((imagenes) => ({ ...locacion, imagenes })))

const aLocacion = (datos) => ({ nombre: datos.nombre.trim(), direccion: datos.direccion.trim() })

export const crearLocacion = (token, datos) => pedir('POST', '/locaciones', token, aLocacion(datos))
export const actualizarLocacion = (token, id, datos) => pedir('PUT', `/locaciones/${id}`, token, aLocacion(datos))
export const eliminarLocacion = (token, id) => pedir('DELETE', `/locaciones/${id}`, token)

export function subirImagenLocacion(token, locacionId, { archivo, orden, descripcion }) {
  const formulario = new FormData()
  formulario.append('archivo', archivo)
  formulario.append('textoAlternativo', descripcion)
  formulario.append('orden', String(orden))
  return pedir('POST', `/locaciones/${locacionId}/imagenes`, token, formulario)
}

export function cambiarImagenLocacion(token, locacionId, imagenId, { orden }) {
  const formulario = new FormData()
  formulario.append('orden', String(orden))
  return pedir('PATCH', `/locaciones/${locacionId}/imagenes/${imagenId}`, token, formulario)
}

export const eliminarImagenLocacion = (token, locacionId, imagenId) =>
  pedir('DELETE', `/locaciones/${locacionId}/imagenes/${imagenId}`, token)

// --- tipos de entrada: solo nombre y descripción. El precio y el cupo se definen en cada evento ---
export const obtenerTiposEntrada = () =>
  consultarPaginas('/tiposEntrada').then((lista) => lista.sort((a, b) => a.nombre.localeCompare(b.nombre)))

const aTipo = (datos) => ({
  nombre: datos.nombre.trim(),
  descripcionBase: datos.descripcion.trim(),
  activo: datos.activo === 'true',
})

export const crearTipoEntrada = (token, datos) => pedir('POST', '/tiposEntrada', token, aTipo(datos))
export const actualizarTipoEntrada = (token, id, datos) => pedir('PUT', `/tiposEntrada/${id}`, token, aTipo(datos))
export const eliminarTipoEntrada = (token, id) => pedir('DELETE', `/tiposEntrada/${id}`, token)

// --- entradas de un evento (un tipo con su precio, cupo y fechas de venta) ---
const aOferta = (datos) => ({
  precio: Number(datos.precio),
  porcentajeDescuento: Number(datos.descuento.trim() === '' ? 0 : datos.descuento),
  cantidadTotal: Number(datos.cantidad),
  fechaInicioVenta: `${datos.inicio}:00`,
  fechaFinVenta: `${datos.fin}:00`,
})

export const crearOferta = (token, eventoId, datos) =>
  pedir('POST', '/eventosTiposEntrada', token, { eventoId, tipoEntradaId: Number(datos.tipoEntradaId), ...aOferta(datos), estado: datos.estado })

// El estado solo se manda si lo cambió el admin: AGOTADO y FINALIZADO los calcula el back.
export const actualizarOferta = (token, id, datos, conEstado) =>
  pedir('PATCH', `/eventosTiposEntrada/${id}`, token, conEstado ? { ...aOferta(datos), estado: datos.estado } : aOferta(datos))

export const eliminarOferta = (token, id) => pedir('DELETE', `/eventosTiposEntrada/${id}`, token)
