import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { diaYFecha, horario } from '../utils/fechas.js'

// Un evento en la lista del administrador, con sus ventas y el botón para editarlo.
export default function FilaEventoAdmin({ evento }) {
  const { tipos, vendidas, total } = evento.ventas
  const activo = evento.estado === 'ACTIVO'

  return (
    <li className={`fila-admin ${activo ? '' : 'fila-admin--pasada'}`}>
      <img src={evento.flyer} alt={`Flyer de ${evento.titulo}`} />
      <div>
        <h3>{evento.titulo}</h3>
        <p>
          {diaYFecha(evento.fechaHoraInicio)} · {horario(evento.fechaHoraInicio, evento.fechaHoraFin)} ·{' '}
          {evento.locacionNombre}
        </p>
      </div>
      <p className={`fila-admin__estado ${activo ? 'oro-texto' : ''}`}>{evento.estado}</p>
      <div className="fila-admin__ventas">
        <p>{tipos} tipos de entrada</p>
        <div className="fila-admin__barra">
          <span className="oro-relleno" style={{ width: `${(vendidas / total) * 100}%` }} />
        </div>
        <strong>
          {vendidas} vendidas de {total}
        </strong>
      </div>
      <div className="fila-admin__acciones">
        <Boton to={`/admin/${evento.id}`} variante="contorno" clase="boton--chico">
          Editar
        </Boton>
        <button type="button" className="fila-admin__mas" aria-label={`Más acciones para ${evento.titulo}`}>
          <Icono nombre="puntos" />
        </button>
      </div>
    </li>
  )
}
