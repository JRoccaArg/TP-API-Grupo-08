import { Link } from 'react-router-dom'
import Boton from './Boton.jsx'

// Pie del formulario de evento: eliminar (solo al editar), cancelar y guardar.
export default function BarraAcciones({ textoGuardar, onGuardar, onEliminar }) {
  return (
    <div className="acciones-admin">
      {onEliminar ? (
        <button type="button" className="acciones-admin__eliminar" onClick={onEliminar}>
          Eliminar evento
        </button>
      ) : (
        <span />
      )}
      <div className="acciones-admin__derecha">
        <Link to="/admin" className="acciones-admin__cancelar">
          Cancelar
        </Link>
        <Boton onClick={onGuardar} clase="boton--grande">
          {textoGuardar}
        </Boton>
      </div>
    </div>
  )
}
