import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { limpiarCarrito } from '../redux/carritoSlice'
import { limpiarCompras } from '../redux/comprasSlice'
import { logout } from '../redux/usuarioSlice'
import { iniciales } from '../utils/formatos.js'
import { borrarSeleccionPendiente } from '../utils/seleccionPendiente.js'
import { borrarSesion } from '../utils/sesion.js'

export default function CuentaChip() {
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const { sesion } = useSelector((state) => state.usuario)

  // Al salir se borra todo lo de esa persona: su carrito y sus compras no pueden quedar a la vista de la siguiente
  const salir = () => {
    borrarSeleccionPendiente()
    borrarSesion()
    dispatch(logout())
    dispatch(limpiarCarrito())
    dispatch(limpiarCompras())
  }

  if (!sesion) {
    // Desde una verificación de entrada, el organizador vuelve ahí al ingresar (igual que con el botón del aviso).
    const state = pathname.startsWith('/verificar/') ? { volverA: pathname } : undefined
    return (
      <Boton to="/login" state={state} clase="boton--chico">
        Ingresar
      </Boton>
    )
  }
  return (
    <div className="cuenta">
      <span className="cuenta__avatar">{iniciales(sesion.nombre)}</span>
      <span className="cuenta__nombre">{sesion.nombre}</span>
      <button type="button" className="cuenta__salir" onClick={salir} aria-label="Cerrar sesión" title="Cerrar sesión">
        <Icono nombre="salir" tamano={18} grosor={1.8} />
      </button>
    </div>
  )
}
