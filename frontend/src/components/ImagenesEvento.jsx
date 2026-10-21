import { useState } from 'react'
import FotoAdmin from './FotoAdmin.jsx'
import SubirFotos from './SubirFotos.jsx'
import { cambiarImagen, eliminarImagen, subirImagen } from '../utils/apiAdmin.js'
import { ordenarImagenes, urlImagen } from '../utils/apiEventos.js'
import { cambiosDeOrden, moverFoto, reemplazarFoto, sinFoto } from '../utils/fotos.js'

// Administrador de fotos de un evento (ya guardado): subir varias, elegir la portada, reordenar y quitar.
// Cada respuesta del back acomoda la lista en pantalla: no se vuelve a pedir nada. El back no obliga a tener una sola
// portada ni órdenes distintos, por eso lo cuida esta pantalla (la portada anterior pasa a galería y se numera de 1).
export default function ImagenesEvento({ eventoId, titulo, token, inicial }) {
  const [imagenes, setImagenes] = useState(inicial)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  const [aQuitar, setAQuitar] = useState(null)

  const agregada = (creada) => setImagenes((actuales) => ordenarImagenes([...actuales, urlImagen(eventoId, creada)]))
  const guardada = (cambiada) =>
    setImagenes((actuales) => ordenarImagenes(reemplazarFoto(actuales, urlImagen(eventoId, cambiada))))

  // Los pedidos se hacen de a uno, en fila. Si uno falla se avisa; los anteriores ya quedaron en la lista.
  const enFila = (tareas) => {
    setOcupado(true)
    setError('')
    setAQuitar(null)
    tareas.reduce((previa, tarea) => previa.then(tarea), Promise.resolve())
      .catch((fallo) => setError(fallo.message))
      .then(() => setOcupado(false))
  }

  const subir = (archivos) => {
    const hayPortada = imagenes.some((imagen) => imagen.tipoImagenEvento === 'PORTADA')
    enFila(archivos.map((archivo, indice) => () =>
      subirImagen(token, eventoId, {
        archivo,
        tipo: !hayPortada && indice === 0 ? 'PORTADA' : 'GALERIA',
        orden: imagenes.length + indice + 1,
        descripcion: titulo,
      }).then(agregada)))
  }

  // Una sola portada: la anterior pasa a galería. Las dos se cambian el orden, así la portada sigue siendo la primera.
  const hacerPortada = (imagen) => {
    const actual = imagenes.find((otra) => otra.tipoImagenEvento === 'PORTADA')
    const tareas = [() => cambiarImagen(token, eventoId, imagen.id, { tipo: 'PORTADA', orden: actual ? actual.orden : imagen.orden }).then(guardada)]
    if (actual) tareas.unshift(() => cambiarImagen(token, eventoId, actual.id, { tipo: 'GALERIA', orden: imagen.orden }).then(guardada))
    enFila(tareas)
  }

  const mover = (indice, salto) => enFila(cambiosDeOrden(moverFoto(imagenes, indice, salto))
    .map(({ foto, orden }) => () => cambiarImagen(token, eventoId, foto.id, { orden }).then(guardada)))

  const quitar = (imagen) => {
    if (aQuitar !== imagen.id) {
      setAQuitar(imagen.id)
      return
    }
    enFila([() => eliminarImagen(token, eventoId, imagen.id)
      .then(() => setImagenes((actuales) => sinFoto(actuales, imagen.id)))])
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
      <SubirFotos ocupado={ocupado} onElegir={subir} onError={setError} />
      {error && <p className="admin__aviso admin__aviso--error" role="alert">{error}</p>}
    </section>
  )
}
