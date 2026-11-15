import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Boton from './Boton.jsx'
import { obtenerFotosLocacion } from '../redux/locacionesSlice'
import { ordenarFotosLocacion, urlFotoLocacion } from '../utils/fotos.js'

export default function FilaLocacionAdmin({ locacion }) {
  const dispatch = useDispatch()

  // Cada fila pide sus fotos una sola vez: después quedan guardadas en la locación
  useEffect(() => {
    if (!locacion.imagenes) dispatch(obtenerFotosLocacion(locacion.id))
  }, [dispatch, locacion.id, locacion.imagenes])

  const fotos = ordenarFotosLocacion((locacion.imagenes || []).map((foto) => urlFotoLocacion(locacion.id, foto)))
  const foto = fotos[0]

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
      <p className="fila-admin__ventas">{!locacion.imagenes ? 'Cargando fotos…' : fotos.length === 1 ? '1 foto' : `${fotos.length} fotos`}</p>
      <div className="fila-admin__acciones">
        <Boton to={`/admin/locaciones/${locacion.id}`} variante="contorno" clase="boton--chico">
          Editar
        </Boton>
      </div>
      {locacion.errorEdicion && <p className="admin__aviso admin__aviso--error fila-tipo__aviso" role="alert">{locacion.errorEdicion}</p>}
    </li>
  )
}
