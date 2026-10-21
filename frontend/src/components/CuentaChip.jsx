import { useLocation } from 'react-router-dom'
import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { iniciales } from '../utils/formatos.js'

// Parte derecha del header: "Ingresar" si no hay sesión; avatar y nombre si la hay.
export default function CuentaChip({ usuario, onSalir }) {
  const { pathname } = useLocation()
  if (!usuario) {
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
      <span className="cuenta__avatar">{iniciales(usuario.nombre)}</span>
      <span className="cuenta__nombre">{usuario.nombre}</span>
      <button type="button" className="cuenta__salir" onClick={onSalir} aria-label="Cerrar sesión" title="Cerrar sesión">
        <Icono nombre="salir" tamano={18} grosor={1.8} />
      </button>
    </div>
  )
}
