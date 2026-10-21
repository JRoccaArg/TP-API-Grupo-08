import { ErrorApi, urlApi } from './apiEventos.js'

// Login y registro contra el backend. Las rutas del back son /api/v1/auth/...; el proxy de Vite le saca el primer
// "/api" a todo lo que pasa por él, por eso desde el front se escribe "/api" dos veces.
function enviarJson(ruta, cuerpo) {
  return fetch(urlApi(ruta), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(cuerpo),
  })
    .then((respuesta) => respuesta.text().then((texto) => {
      let datos
      try { datos = JSON.parse(texto) } catch { /* puede ser un error del proxy sin JSON */ }
      if (!respuesta.ok) {
        throw new ErrorApi(datos?.message || 'No pudimos completar la operación. Intentá nuevamente.', respuesta.status)
      }
      if (!datos?.access_token || !datos.role) throw new ErrorApi('El servidor no devolvió los datos esperados.')
      return datos
    }))
    .catch((error) => {
      if (error instanceof ErrorApi) throw error
      throw new ErrorApi('No pudimos conectarnos. Revisá tu conexión e intentá nuevamente.')
    })
}

const aSesion = (respuesta) => ({
  token: respuesta.access_token,
  email: respuesta.email,
  nombre: `${respuesta.nombre} ${respuesta.apellido}`.trim(),
  rol: respuesta.role,
})

export const iniciarSesion = (email, password) =>
  enviarJson('/api/v1/auth/authenticate', { email: email.trim(), password }).then(aSesion)

export const registrarse = (datos) =>
  enviarJson('/api/v1/auth/register', {
    firstname: datos.firstname.trim(),
    lastname: datos.lastname.trim(),
    dni: datos.dni.trim(),
    fechaNacimiento: datos.fechaNacimiento,
    email: datos.email.trim(),
    password: datos.password,
  }).then(aSesion)
