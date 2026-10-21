import Boton from './Boton.jsx'

export default function FilaLocacionAdmin({ locacion }) {
  const foto = locacion.imagenes[0]
  const cantidad = locacion.imagenes.length

  return (
    <li className="fila-admin fila-admin--locacion">
      {foto ? (
        <img src={foto.url} alt={foto.descripcion || `Foto de ${locacion.nombre}`} />
      ) : (
        <span className="fila-admin__sin-foto">Sin foto</span>
      )}
      <div>
        <h3>{locacion.nombre}</h3>
        <p>{locacion.direccion}</p>
      </div>
      <p className="fila-admin__ventas">{cantidad === 1 ? '1 foto' : `${cantidad} fotos`}</p>
      <div className="fila-admin__acciones">
        <Boton to={`/admin/locaciones/${locacion.id}`} variante="contorno" clase="boton--chico">
          Editar
        </Boton>
      </div>
    </li>
  )
}
