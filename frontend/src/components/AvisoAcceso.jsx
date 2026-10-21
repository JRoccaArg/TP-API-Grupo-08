import Aviso from './Aviso.jsx'

// Lo que se ve cuando una pantalla no es para quien la abre. Sin sesión se pide ingresar; con sesión se explica para
// quién es la pantalla (no se le pide ingresar a quien ya lo hizo). "para" es el rol de la pantalla: ADMIN o USER.
// "sinSesion" es lo que dice la pantalla cuando todavía no hay sesión.
export default function AvisoAcceso({ usuario, para, sinSesion }) {
  if (!usuario) return <Aviso mensaje={sinSesion} boton="Ingresar" to="/login" />
  if (para === 'ADMIN') return <Aviso mensaje="Esta sección es solo para administradores." boton="Ir al inicio" to="/" />
  return <Aviso mensaje="Esta sección es para quienes compran: el administrador no tiene carrito ni entradas." boton="Ir al panel" to="/admin" />
}
