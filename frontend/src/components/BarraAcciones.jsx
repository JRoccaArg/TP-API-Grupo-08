import Boton from './Boton.jsx'

// El botón de guardar queda en esta barra, fuera del <form>: "formulario" es el id de ese form.
// Así el clic y el Enter envían el mismo formulario, y es su onSubmit el que despacha.
export default function BarraAcciones({ textoGuardar, textoEliminar = 'Eliminar evento', volverA = '/admin', formulario, ocupado = false, onEliminar }) {
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
        <Boton tipo="submit" formulario={formulario} deshabilitado={ocupado} clase="boton--grande">
          {textoGuardar}
        </Boton>
      </div>
    </div>
  )
}
