import CampoLinea from './CampoLinea.jsx'

// Al enviarlo (botón de la barra o Enter) llama a onGuardar
export default function FormularioLocacion({ datos, onCambiar, onGuardar }) {
  const cambiar = (campo) => (evento) => onCambiar(campo, evento.target.value)

  return (
    <form id="form-locacion" className="form-evento" onSubmit={onGuardar}>
      <p className="admin__seccion">DATOS DEL LUGAR</p>
      <CampoLinea etiqueta="NOMBRE" nombre="nombre" valor={datos.nombre} onChange={cambiar('nombre')} placeholder="Nombre del lugar" />
      <CampoLinea etiqueta="DIRECCIÓN" nombre="direccion" valor={datos.direccion} onChange={cambiar('direccion')} placeholder="Calle, número y ciudad" />
    </form>
  )
}
