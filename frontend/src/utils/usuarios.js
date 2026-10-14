// Sesión de mentira: no hay backend. El email admin@zenoir.com entra como ADMIN, cualquier otro como USER.
import { capitalizar } from './formatos.js'

const EMAIL_ADMIN = 'admin@zenoir.com'

export const crearUsuario = (email, nombre) => {
  const base = nombre || email.split('@')[0]
  return {
    nombre: capitalizar(base),
    email,
    rol: email === EMAIL_ADMIN ? 'ADMIN' : 'USER',
  }
}
