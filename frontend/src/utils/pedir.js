import { ErrorApi, urlApi } from './apiEventos.js'

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
