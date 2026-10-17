import { useState } from 'react'
import ImagenEvento from './ImagenEvento.jsx'

export default function FlyerEvento({ evento }) {
  const [elegida, setElegida] = useState(null)
  const imagenes = evento.imagenes || []
  const principal = imagenes.find((imagen) => imagen.id === elegida) || imagenes[0]
  return (
    <div className="galeria-evento">
      <div className="evento__flyer">
        <ImagenEvento imagen={principal} titulo={evento.titulo} />
      </div>
      {imagenes.length > 1 && (
        <div className="galeria-evento__opciones" role="group" aria-label="Imágenes del evento">
          {imagenes.map((imagen, indice) => (
            <button key={imagen.id} type="button" aria-pressed={principal.id === imagen.id}
              aria-label={`Ver imagen ${indice + 1} de ${evento.titulo}`} onClick={() => setElegida(imagen.id)}>
              <ImagenEvento imagen={imagen} titulo={evento.titulo} />
            </button>
          ))}
        </div>
      )}
      {evento.errorImagenes && <p className="catalogo-nota">No pudimos cargar las imágenes. Podés reintentar la consulta.</p>}
    </div>
  )
}
