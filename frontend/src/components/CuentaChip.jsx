import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { iniciales } from '../utils/formatos.js'

// Parte derecha del header: "Ingresar" si no hay sesión; avatar y nombre si la hay.
export default function CuentaChip({ usuario, onSalir }) {
  if (!usuario) {
    return (
      <Boton to="/login" clase="boton--chico">
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
