import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'

const ESTADOS = [{ valor: 'true', texto: 'Activo' }, { valor: 'false', texto: 'Inactivo' }]

// Nombre y descripción de un tipo de entrada (y, al editar, si está activo).
// Un tipo inactivo no se ofrece en eventos nuevos, pero sigue en los que ya lo tienen.
export default function FormTipoEntrada({ datos, onCambiar, conEstado = false }) {
  const cambiar = (campo) => (evento) => onCambiar(campo, evento.target.value)

  return (
    <div className="form-tipo">
      <CampoLinea etiqueta="NOMBRE" nombre="tipo-nombre" valor={datos.nombre} onChange={cambiar('nombre')} placeholder="General, VIP, Preventa 1…" />
      <CampoLinea
        etiqueta="DESCRIPCIÓN"
        nombre="tipo-descripcion"
        valor={datos.descripcion}
        onChange={cambiar('descripcion')}
        placeholder="Qué incluye esta entrada"
      />
      {conEstado && <CampoSelect etiqueta="ESTADO" nombre="tipo-activo" opciones={ESTADOS} valor={datos.activo} onChange={cambiar('activo')} />}
    </div>
  )
}
