import { useState } from 'react'
import '../styles/imagen-evento.css'

// La imagen del evento sale del back. Si el evento no tiene o no se pudo cargar, se avisa en lugar de poner otra.
export default function ImagenEvento({ imagen, titulo, className = '' }) {
  const [fallida, setFallida] = useState('') // la url de la imagen que no cargó
  const disponible = Boolean(imagen?.url) && fallida !== imagen.url

  return (
    <div className={`imagen-evento ${className}`}>
      {disponible ? (
        <img key={imagen.url} src={imagen.url} alt={imagen.descripcion || `Imagen de ${titulo}`} loading="lazy" onError={() => setFallida(imagen.url)} />
      ) : (
        <div className="imagen-evento__vacia" role="img" aria-label={`Sin imagen disponible de ${titulo}`}>
          <span>ZENOIR</span><small>Imagen no disponible</small>
        </div>
      )}
    </div>
  )
}
