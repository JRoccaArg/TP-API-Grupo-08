import { useState } from 'react'
import FotoAdmin from './FotoAdmin.jsx'
import SubirFotos from './SubirFotos.jsx'
import { cambiarImagenLocacion, eliminarImagenLocacion, ordenarFotosLocacion, subirImagenLocacion, urlFotoLocacion } from '../utils/apiAdmin.js'
import { cambiosDeOrden, moverFoto, reemplazarFoto, sinFoto } from '../utils/fotos.js'

// Administrador de fotos de una locación (ya guardada): subir varias, reordenar y quitar. Sin portada: solo el orden.
// Cada respuesta del back acomoda la lista en pantalla: no se vuelve a pedir nada.
export default function FotosLocacion({ locacionId, nombre, token, inicial }) {
  const [imagenes, setImagenes] = useState(inicial)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  const [aQuitar, setAQuitar] = useState(null)

  const agregada = (creada) => setImagenes((actuales) => ordenarFotosLocacion([...actuales, urlFotoLocacion(locacionId, creada)]))
  const guardada = (cambiada) =>
    setImagenes((actuales) => ordenarFotosLocacion(reemplazarFoto(actuales, urlFotoLocacion(locacionId, cambiada))))

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
    const ultimo = Math.max(0, ...imagenes.map((imagen) => imagen.orden ?? 0))
    enFila(archivos.map((archivo, indice) => () =>
      subirImagenLocacion(token, locacionId, { archivo, orden: ultimo + indice + 1, descripcion: nombre }).then(agregada)))
  }

  const mover = (indice, salto) => enFila(cambiosDeOrden(moverFoto(imagenes, indice, salto))
    .map(({ foto, orden }) => () => cambiarImagenLocacion(token, locacionId, foto.id, { orden }).then(guardada)))

  // Quitar pide una segunda confirmación: el primer clic arma el botón, el segundo borra.
  const quitar = (imagen) => {
    if (aQuitar !== imagen.id) {
      setAQuitar(imagen.id)
      return
    }
    enFila([() => eliminarImagenLocacion(token, locacionId, imagen.id)
      .then(() => setImagenes((actuales) => sinFoto(actuales, imagen.id)))])
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
      <SubirFotos ocupado={ocupado} onElegir={subir} onError={setError} />
      {error && <p className="admin__aviso admin__aviso--error" role="alert">{error}</p>}
    </section>
  )
}
