import { Link } from 'react-router-dom'
import Icono from './Icono.jsx'
import ImagenEvento from './ImagenEvento.jsx'
import { eventoCancelado, eventoReprogramado } from '../utils/compras.js'
import { diaYFecha, fechaLarga } from '../utils/fechas.js'

export default function EventoComprado({ grupo }) {
  const { evento, entradas } = grupo
  const titulo = evento?.titulo || grupo.titulo
  const destino = `/mis-entradas/${grupo.id}`
  const usadas = entradas.filter((entrada) => entrada.estado === 'UTILIZADO').length

  return (
    <article className="flyer">
      <Link to={destino} className="flyer__imagen" aria-label={`Ver tus entradas de ${titulo}`}>
        <ImagenEvento imagen={evento?.imagenes?.[0]} titulo={titulo} className="flyer__visual" />
        {evento && <span className="flyer__fecha">{fechaLarga(evento.fechaHoraInicio)}</span>}
      </Link>
      <div className="flyer__pie">
        <h3 className="flyer__titulo"><Link to={destino}>{titulo}</Link></h3>
        {evento && (
          <p className="flyer__lugar">
            <strong>{evento.locacionNombre}</strong>
            <span>{diaYFecha(evento.fechaHoraInicio)}</span>
          </p>
        )}
        <div className="flyer__accion">
          <p>
            <small>{eventoCancelado(evento) ? 'EVENTO CANCELADO' : eventoReprogramado(evento) ? 'EVENTO REPROGRAMADO' : usadas > 0 ? `TUS ENTRADAS · ${usadas} USADA${usadas > 1 ? 'S' : ''}` : 'TUS ENTRADAS'}</small>
            <strong className="oro-texto">{entradas.length} {entradas.length === 1 ? 'entrada' : 'entradas'}</strong>
          </p>
          <Link to={destino} className="flyer__ir oro-relleno brillo" aria-label={`Ver los QR de ${titulo}`}>
            <Icono nombre="diagonal" />
          </Link>
        </div>
      </div>
    </article>
  )
}
