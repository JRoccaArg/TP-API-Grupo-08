import CampoLinea from './CampoLinea.jsx'

export default function FormularioLocacion({ datos, onCambiar }) {
  const cambiar = (campo) => (evento) => onCambiar(campo, evento.target.value)

  return (
    <form className="form-evento" onSubmit={(e) => e.preventDefault()}>
      <p className="admin__seccion">DATOS DEL LUGAR</p>
      <CampoLinea etiqueta="NOMBRE" nombre="nombre" valor={datos.nombre} onChange={cambiar('nombre')} placeholder="Nombre del lugar" />
      <CampoLinea etiqueta="DIRECCIÓN" nombre="direccion" valor={datos.direccion} onChange={cambiar('direccion')} placeholder="Calle, número y ciudad" />
    </form>
  )
}
