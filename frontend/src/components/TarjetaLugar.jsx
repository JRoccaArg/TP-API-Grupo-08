import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Icono from './Icono.jsx'
import { obtenerFotosLocacion } from '../redux/locacionesSlice'
import { ordenarFotosLocacion, urlFotoLocacion } from '../utils/fotos.js'

// Un lugar del inicio, con el estilo de las tarjetas de eventos: su primera foto y, abajo, nombre, dirección y botón. Todo sale de la locación del back
export default function TarjetaLugar({ lugar }) {
  const dispatch = useDispatch()

  // Cada tarjeta pide sus fotos una sola vez: después quedan guardadas en la locación
  useEffect(() => {
    if (!lugar.imagenes) dispatch(obtenerFotosLocacion(lugar.id))
  }, [dispatch, lugar.id, lugar.imagenes])

  const foto = ordenarFotosLocacion((lugar.imagenes || []).map((imagen) => urlFotoLocacion(lugar.id, imagen)))[0]

  // Un lugar sin fotos no se muestra en el inicio (en el admin sí). Mientras llegan tampoco, así no aparece y desaparece
  if (!foto) return null

  return (
    <article className="lugar">
      <a href="#fechas" className="lugar__foto" aria-label={`Ver fechas en ${lugar.nombre}`}>
        <img className="ken" src={foto.url} alt={foto.descripcion || `Foto de ${lugar.nombre}`} />
      </a>
      <div className="lugar__pie">
        <div>
          <h3 className="lugar__nombre">{lugar.nombre}</h3>
          <p className="lugar__direccion">{lugar.direccion}</p>
        </div>
        <a href="#fechas" className="flyer__ir oro-relleno brillo" aria-label={`Ver fechas en ${lugar.nombre}`}>
          <Icono nombre="diagonal" />
        </a>
      </div>
    </article>
  )
}
