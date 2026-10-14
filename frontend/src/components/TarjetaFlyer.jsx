import { Link } from 'react-router-dom'
import Icono from './Icono.jsx'
import { fechaLarga } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'

// Tarjeta con el flyer de un evento. Si el evento ya terminó se muestra apagada y sin precio.
export default function TarjetaFlyer({ evento, indice }) {
  const activo = evento.estado === 'ACTIVO'
  const destino = `/eventos/${evento.id}`

  return (
    <article
      className={`flyer flotar ${activo ? '' : 'flyer--pasado'}`}
      style={{ animationDelay: `-${indice * 1.5}s` }}
    >
      <Link to={destino} className="flyer__imagen">
        <img src={evento.flyer} alt={`Flyer de ${evento.titulo}`} />
        <span className="flyer__fecha">{fechaLarga(evento.fechaHoraInicio)}</span>
      </Link>
      <div className="flyer__pie">
        <p className="flyer__lugar">
          <strong>{evento.locacionNombre}</strong>
          <span>{evento.locacionDireccion}</span>
        </p>
        {activo ? (
          <div className="flyer__accion">
            <p>
              <small>DESDE</small>
              <strong className="oro-texto">{precio(evento.precioDesde)}</strong>
            </p>
            <Link to={destino} className="flyer__ir oro-relleno brillo" aria-label={`Comprar entradas para ${evento.titulo}`}>
              <Icono nombre="diagonal" />
            </Link>
          </div>
        ) : (
          <div className="flyer__accion">
            <small>EDICIÓN FINALIZADA</small>
            <a href="#fotos" className="enlace-oro">
              Ver fotos
            </a>
          </div>
        )}
      </div>
    </article>
  )
}
