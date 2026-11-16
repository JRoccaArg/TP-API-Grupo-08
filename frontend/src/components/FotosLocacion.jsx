import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FotoAdmin from './FotoAdmin.jsx'
import SubirFotos from './SubirFotos.jsx'
import { cambiarOrdenFotoLocacion, eliminarFotoLocacion, subirFotoLocacion } from '../redux/locacionesSlice'
import { cambiosDeOrden, moverFoto, ordenarFotosLocacion, urlFotoLocacion } from '../utils/fotos.js'

// Fotos de una locación (ya guardada): subir varias, reordenar y quitar. Sin portada, solo el orden.
// Cada pedido es su propia acción: si un clic necesita varios (por ejemplo, mover), se despacha una por pedido.
export default function FotosLocacion({ locacion }) {
  const { sesion } = useSelector((state) => state.usuario)
  const dispatch = useDispatch()
  const [aviso, setAviso] = useState('')
  const [aQuitar, setAQuitar] = useState(null)
  const imagenes = ordenarFotosLocacion(locacion.imagenes.map((foto) => urlFotoLocacion(locacion.id, foto)))
  const ocupado = Boolean(locacion.guardandoFotos)

  const subir = (archivos) => {
    setAviso('')
    const ultimo = Math.max(0, ...imagenes.map((imagen) => imagen.orden ?? 0))
    archivos.forEach((archivo, indice) => {
      dispatch(subirFotoLocacion({ token: sesion.token, locacionId: locacion.id, archivo, orden: ultimo + indice + 1, textoAlternativo: locacion.nombre }))
    })
  }

  // Las fotos se numeran de 1 en adelante en el nuevo orden: se manda solo cada una que cambió de número
  const mover = (indice, salto) => {
    setAQuitar(null)
    cambiosDeOrden(moverFoto(imagenes, indice, salto)).forEach(({ foto, orden }) => {
      dispatch(cambiarOrdenFotoLocacion({ token: sesion.token, locacionId: locacion.id, imagenId: foto.id, orden }))
    })
  }

  const quitar = (imagen) => {
    if (aQuitar !== imagen.id) {
      setAQuitar(imagen.id)
      return
    }
    dispatch(eliminarFotoLocacion({ token: sesion.token, locacionId: locacion.id, imagenId: imagen.id }))
    setAQuitar(null)
  }

  return (
    <section className="fotos-admin" aria-label="Fotos del lugar">
      <p className="admin__seccion">FOTOS DEL LUGAR</p>
      <p className="fotos-admin__nota">La primera foto es la que se ve en la lista. Las demás siguen este orden.</p>
      {imagenes.length === 0 ? (
        <p className="fotos-admin__vacia">Todavía no hay fotos.</p>
      ) : (
        <ul className="fotos-admin__lista">
          {imagenes.map((imagen, indice) => (
            <FotoAdmin
              key={imagen.id}
              imagen={imagen}
              indice={indice}
              total={imagenes.length}
              conPortada={false}
              anteriorEsPortada={false}
              ocupado={ocupado}
              quitando={aQuitar === imagen.id}
              onMover={(salto) => mover(indice, salto)}
              onQuitar={() => quitar(imagen)}
            />
          ))}
        </ul>
      )}
      <SubirFotos ocupado={ocupado} onElegir={subir} onError={setAviso} />
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
    </section>
  )
}
