// La sesión ({ token, email, nombre, rol }) se guarda en localStorage del navegador: así sobrevive a F5 y a cerrar la pestaña.
// localStorage guarda texto, por eso se pasa a JSON al guardar y de vuelta a objeto al leer.
// Si el navegador no lo permite (modo privado, datos bloqueados) la app sigue andando: solo se pierde la sesión al recargar.
const CLAVE = 'zenoir.sesion'

// Un token JWT es "cabecera.datos.firma". "datos" es un JSON en base64 que trae "exp": cuándo vence, en segundos.
const datosDelToken = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export const tokenVencido = (token, ahora = Date.now()) => {
  const datos = datosDelToken(token)
  return !datos || typeof datos.exp !== 'number' || datos.exp * 1000 <= ahora
}

// Devuelve la sesión guardada, o null si no hay o ya venció.
export const leerSesion = () => {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE))
    return sesion && sesion.token && !tokenVencido(sesion.token) ? sesion : null
  } catch {
    return null
  }
}

export const guardarSesion = (sesion) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesion))
  } catch {
    /* sin almacenamiento: la sesión dura hasta recargar */
  }
}

export const borrarSesion = () => {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    /* no había nada que borrar */
  }
}
