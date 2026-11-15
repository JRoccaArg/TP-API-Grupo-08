import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SeccionConAncla from './SeccionConAncla.jsx'
import TarjetaLugar from './TarjetaLugar.jsx'
import { obtenerLocaciones } from '../redux/locacionesSlice'

export default function SeccionDonde({ listo }) {
  const dispatch = useDispatch()
  const { items, error, cargado } = useSelector((state) => state.locaciones)
  const lugares = [...items].sort((a, b) => a.nombre.localeCompare(b.nombre))

  // Si ya están en el store no se vuelven a pedir
  useEffect(() => {
    if (!cargado) dispatch(obtenerLocaciones())
  }, [dispatch, cargado])

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
      {/* El error también puede venir del admin: acá importa solo si los lugares no se cargaron */}
      {error && !cargado ? (
        <div className="catalogo-eventos__estado" role="alert">
          <h3>No pudimos cargar los lugares</h3>
          <p>{error}</p>
          <button className="catalogo-eventos__boton" type="button" onClick={() => dispatch(obtenerLocaciones())}>Reintentar</button>
        </div>
      ) : !cargado ? (
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
