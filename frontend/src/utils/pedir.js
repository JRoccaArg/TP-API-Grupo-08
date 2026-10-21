import { ErrorApi, urlApi } from './apiEventos.js'

// Cuando el back responde 401 la sesión ya no sirve (venció o el token dejó de valer): quien arma la app registra acá qué hacer
// (cerrarla). Un 403 es otra cosa: la sesión sirve, pero no tiene permiso para eso.
let alVencerLaSesion = () => {}
export const avisarSiVenceLaSesion = (funcion) => { alVencerLaSesion = funcion }

// Pedidos al backend que piden sesión (administración y carrito). Todos llevan el token en el encabezado "Authorization: Bearer <token>".
// "cuerpo" puede ser un objeto (se manda como JSON) o un FormData (se manda como formulario con archivos).
export function pedir(metodo, ruta, token, cuerpo) {
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
        if (respuesta.status === 401) alVencerLaSesion()
        throw new ErrorApi(
          respuesta.status === 401 ? 'Tu sesión venció. Ingresá de nuevo.'
            : respuesta.status === 403 ? 'No tenés permiso para hacer esto.'
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
