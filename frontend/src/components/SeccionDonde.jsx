import { useEffect, useState } from 'react'
import SeccionConAncla from './SeccionConAncla.jsx'
import TarjetaLugar from './TarjetaLugar.jsx'
import { obtenerLocacionesConFotos } from '../utils/apiAdmin.js'

// Cabecera (título a la izquierda, bajada a la derecha) y una tarjeta por cada locación que hay cargada en el back.
export default function SeccionDonde({ listo }) {
  const [lugares, setLugares] = useState(null) // null = todavía cargando
  const [error, setError] = useState('')
  const [reintento, setReintento] = useState(0)

  useEffect(() => {
    let activo = true
    obtenerLocacionesConFotos()
      .then((lista) => { if (activo) { setLugares(lista); setError('') } })
      .catch((fallo) => { if (activo) setError(fallo.message) })
    return () => { activo = false }
  }, [reintento])

  const reintentar = () => {
    setError('')
    setReintento((actual) => actual + 1)
  }

  return (
    <SeccionConAncla id="donde" className="donde" listo={listo}>
      <div className="donde__cabecera">
        <div>
          <p className="donde__etiqueta">Dónde</p>
          <h2 className="titulo-seccion">
            NUESTROS
            <br />
            <span className="oro-texto">LUGARES</span>
          </h2>
        </div>
        <p className="donde__bajada">Cada edición cambia de clima y a veces de casa. Cada fecha indica su lugar.</p>
      </div>
      {error ? (
        <div className="catalogo-eventos__estado" role="alert">
          <h3>No pudimos cargar los lugares</h3>
          <p>{error}</p>
          <button className="catalogo-eventos__boton" type="button" onClick={reintentar}>Reintentar</button>
        </div>
      ) : lugares === null ? (
        <div className="catalogo-eventos__estado" role="status">
          <span className="catalogo-eventos__pulso" aria-hidden="true" />
          <p>Cargando lugares…</p>
        </div>
      ) : lugares.length === 0 ? (
        <div className="catalogo-eventos__estado" role="status">
          <h3>Todavía no hay lugares cargados</h3>
        </div>
      ) : (
        <div className="donde__lugares">
          {lugares.map((lugar) => (
            <TarjetaLugar key={lugar.id} lugar={lugar} />
          ))}
        </div>
      )}
    </SeccionConAncla>
  )
}
