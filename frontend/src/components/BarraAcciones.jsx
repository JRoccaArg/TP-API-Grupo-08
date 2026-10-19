import Boton from './Boton.jsx'

// Pie del formulario de evento: eliminar (solo al editar), cancelar y guardar. "ocupado" bloquea los botones mientras se guarda.
export default function BarraAcciones({ textoGuardar, textoEliminar = 'Eliminar evento', volverA = '/admin', ocupado = false, onGuardar, onEliminar }) {
  return (
    <div className="acciones-admin">
      {onEliminar ? (
        <Boton variante="peligro" deshabilitado={ocupado} onClick={onEliminar}>
          {textoEliminar}
        </Boton>
      ) : (
        <span />
      )}
      <div className="acciones-admin__derecha">
        <Boton to={volverA} variante="contorno">
          Cancelar
        </Boton>
        <Boton onClick={onGuardar} deshabilitado={ocupado} clase="boton--grande">
          {textoGuardar}
        </Boton>
      </div>
    </div>
  )
}
