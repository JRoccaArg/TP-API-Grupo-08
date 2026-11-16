import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Sitio from './Sitio.jsx'
import { limpiarCarrito } from './redux/carritoSlice'
import { limpiarCompras } from './redux/comprasSlice'
import { sesionVencida } from './redux/usuarioSlice'
import { borrarSesion, vencimientoDelToken } from './utils/sesion.js'

// La sesión vive en el store (usuarioSlice). App lleva su reloj, como Sitio lleva el del carrito
export default function App() {
  const dispatch = useDispatch()
  const { sesion } = useSelector((state) => state.usuario)

  // Cuando vence el token la sesión se cierra sola: se borra lo de esa persona y queda el aviso "Tu sesión venció"
  useEffect(() => {
    if (!sesion) return undefined
    const reloj = setTimeout(() => {
      borrarSesion()
      dispatch(sesionVencida())
      dispatch(limpiarCarrito())
      dispatch(limpiarCompras())
    }, vencimientoDelToken(sesion.token) - Date.now())
    return () => clearTimeout(reloj)
  }, [dispatch, sesion])

  // Con otra sesión (o sin ninguna) Sitio empieza de cero
  return <Sitio key={sesion ? sesion.token : 'sin-sesion'} />
}
