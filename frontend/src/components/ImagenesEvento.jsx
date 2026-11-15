import { useState } from 'react'
import { useDispatch } from 'react-redux'
import FotoAdmin from './FotoAdmin.jsx'
import SubirFotos from './SubirFotos.jsx'
import { cambiarImagen, eliminarImagen, subirImagen } from '../redux/eventosSlice'
import { ordenarImagenes, urlImagen } from '../utils/apiEventos.js'
import { cambiosDeOrden, moverFoto } from '../utils/fotos.js'

// Fotos de un evento (ya guardado): subir varias, elegir la portada, reordenar y quitar. El back no obliga a tener una sola
// portada ni órdenes distintos, por eso lo cuida esta pantalla (la portada anterior pasa a galería y se numera de 1).
// Cada pedido es su propia acción: si un clic necesita varios, se despacha una acción por pedido, sin esperar.
export default function ImagenesEvento({ evento, token }) {
  const dispatch = useDispatch()
  const [aviso, setAviso] = useState('')
  const [aQuitar, setAQuitar] = useState(null)
  const imagenes = ordenarImagenes(evento.imagenes.map((imagen) => urlImagen(evento.id, imagen)))
  const ocupado = Boolean(evento.guardandoFotos)

  const subir = (archivos) => {
    setAviso('')
    const hayPortada = imagenes.some((imagen) => imagen.tipoImagenEvento === 'PORTADA')
    archivos.forEach((archivo, indice) => {
      dispatch(subirImagen({
        token,
        eventoId: evento.id,
        archivo,
        tipo: !hayPortada && indice === 0 ? 'PORTADA' : 'GALERIA',
        orden: imagenes.length + indice + 1,
        descripcion: evento.titulo,
      }))
    })
  }

  // Una sola portada: la anterior pasa a galería. Las dos intercambian el orden, así la portada sigue siendo la primera.
  const hacerPortada = (imagen) => {
    setAQuitar(null)
    const actual = imagenes.find((otra) => otra.tipoImagenEvento === 'PORTADA')
    if (actual) {
      dispatch(cambiarImagen({ token, eventoId: evento.id, imagenId: actual.id, tipo: 'GALERIA', orden: imagen.orden }))
    }
    dispatch(cambiarImagen({ token, eventoId: evento.id, imagenId: imagen.id, tipo: 'PORTADA', orden: actual ? actual.orden : imagen.orden }))
  }

  // Las fotos se numeran de 1 en adelante en el nuevo orden: se manda solo cada una que cambió de número
  const mover = (indice, salto) => {
    setAQuitar(null)
    cambiosDeOrden(moverFoto(imagenes, indice, salto)).forEach(({ foto, orden }) => {
      dispatch(cambiarImagen({ token, eventoId: evento.id, imagenId: foto.id, tipo: foto.tipoImagenEvento, orden }))
    })
  }

  const quitar = (imagen) => {
    if (aQuitar !== imagen.id) {
      setAQuitar(imagen.id)
      return
    }
    dispatch(eliminarImagen({ token, eventoId: evento.id, imagenId: imagen.id }))
    setAQuitar(null)
  }

  return (
    <section className="fotos-admin" aria-label="Fotos del evento">
      <p className="admin__seccion">FOTOS DEL EVENTO</p>
      <p className="fotos-admin__nota">
        La portada es la que se ve en las fechas. Las demás forman la galería de la página del evento, en este orden.
      </p>
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
              anteriorEsPortada={indice > 0 && imagenes[indice - 1].tipoImagenEvento === 'PORTADA'}
              ocupado={ocupado}
              quitando={aQuitar === imagen.id}
              onPortada={() => hacerPortada(imagen)}
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
