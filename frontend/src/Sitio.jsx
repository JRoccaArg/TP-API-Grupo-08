import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import AvisoSesion from './components/AvisoSesion.jsx'
import Navbar from './components/Navbar.jsx'
import RutasSitio from './RutasSitio.jsx'
import { limpiarCarrito, obtenerCarrito } from './redux/carritoSlice'
import { limpiarCompras } from './redux/comprasSlice'
import { obtenerEvento, obtenerImagenes } from './redux/eventosSlice'
import { idsDeEventos, vencimientoMs } from './utils/carrito.js'
import { borrarSeleccionPendiente } from './utils/seleccionPendiente.js'

const SIN_NAVBAR = ['/login', '/registro']

// Sitio pide el carrito (solo el rol USER tiene), lleva su reloj y pide los eventos que aparecen en él. El carrito vive en el store.
export default function Sitio({ usuario, sesionVencida, onIngresar, onSalir }) {
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const { carrito, cargado } = useSelector((state) => state.carrito)
  const { items, pedidos } = useSelector((state) => state.eventos)
  const token = usuario?.rol === 'USER' ? usuario.token : null
  const venceEn = vencimientoMs(carrito)
  const ids = idsDeEventos(carrito)
  // De cada evento del carrito hacen falta su flyer, su fecha y su lugar: se pide solo lo que todavía no está en el store
  const faltan = ids.filter((id) => !items.some((evento) => evento.id === id) && !pedidos.includes(id))
  const sinFotos = items.filter((evento) => ids.includes(evento.id) && !evento.imagenes).map((evento) => evento.id)

  useEffect(() => {
    if (token && !cargado) dispatch(obtenerCarrito(token))
  }, [dispatch, token, cargado])

  useEffect(() => {
    faltan.forEach((id) => dispatch(obtenerEvento({ id })))
  }, [dispatch, faltan])

  useEffect(() => {
    sinFotos.forEach((eventoId) => dispatch(obtenerImagenes({ eventoId })))
  }, [dispatch, sinFotos])

  // Llegada la hora de vencimiento se le pregunta al back cuál es el carrito: si devuelve otro, el anterior se venció
  useEffect(() => {
    if (!token || venceEn === null) return undefined
    const restante = venceEn - Date.now()
    const reloj = setTimeout(() => dispatch(obtenerCarrito(token)), restante > 0 ? restante : 30000)
    return () => clearTimeout(reloj)
  }, [dispatch, token, venceEn, carrito])

  // Al salir se borra lo de esa persona: su carrito y sus compras no pueden quedar a la vista de la siguiente
  const salir = () => {
    borrarSeleccionPendiente()
    dispatch(limpiarCarrito())
    dispatch(limpiarCompras())
    onSalir()
  }

  return (
    <>
      {!SIN_NAVBAR.includes(pathname) && <Navbar usuario={usuario} onSalir={salir} />}
      {sesionVencida && !SIN_NAVBAR.includes(pathname) && <AvisoSesion />}
      <RutasSitio usuario={usuario} onIngresar={onIngresar} />
    </>
  )
}
