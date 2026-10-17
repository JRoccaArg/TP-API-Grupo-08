import { useState } from 'react'
import { imagenReferenciaEvento } from '../utils/imagenesEventos.js'
import '../styles/imagen-evento.css'

// Primero se intenta la imagen de la API; los archivos originales sirven de respaldo.
export default function ImagenEvento({ imagen, titulo, className = '' }) {
  const [fallidas, setFallidas] = useState([])
  const referencia = imagenReferenciaEvento(titulo)
  const principalDisponible = imagen?.url && !fallidas.includes(imagen.url)
  const url = principalDisponible ? imagen.url : !fallidas.includes(referencia.url) ? referencia.url : null
  const esReferencia = Boolean(url && !principalDisponible)
  const marcarError = () => setFallidas((actuales) => actuales.includes(url) ? actuales : [...actuales, url])

  return (
    <div className={`imagen-evento ${esReferencia && referencia.esFlyer ? 'imagen-evento--flyer-referencia' : ''} ${className}`}>
      {url ? (
        <>
          <img key={url} src={url}
            alt={esReferencia ? referencia.esFlyer ? 'Flyer de referencia de Zenoir' : 'Cartel de neón de Zenoir, imagen de referencia' : imagen.descripcion || `Imagen de ${titulo}`}
            loading="lazy" onError={marcarError} />
          {esReferencia && <span className="imagen-evento__referencia">Imagen de referencia</span>}
        </>
      ) : (
        <div className="imagen-evento__vacia" role="img" aria-label={`Sin imagen disponible de ${titulo}`}>
          <span>ZENOIR</span><small>Imagen no disponible</small>
        </div>
      )}
    </div>
  )
}
