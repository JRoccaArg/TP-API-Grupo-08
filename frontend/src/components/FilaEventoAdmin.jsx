import Boton from './Boton.jsx'
import { diaYFecha, horario } from '../utils/fechas.js'

// Un evento real en la lista del administrador: su portada, cuándo y dónde es, su estado y sus entradas.
export default function FilaEventoAdmin({ evento }) {
  const activo = evento.estado === 'ACTIVO'
  const portada = evento.imagenes?.[0]
  const disponibles = evento.ofertas.reduce((total, oferta) => total + oferta.cantidadDisponible, 0)

  return (
    <li className={`fila-admin ${activo ? '' : 'fila-admin--pasada'}`}>
      {portada ? (
        <img src={portada.url} alt={`Portada de ${evento.titulo}`} />
      ) : (
        <span className="fila-admin__sin-foto">Sin foto</span>
      )}
      <div>
        <h3>{evento.titulo}</h3>
        <p>
          {diaYFecha(evento.fechaHoraInicio)} · {horario(evento.fechaHoraInicio, evento.fechaHoraFin)} ·{' '}
          {evento.locacionNombre}
        </p>
      </div>
      <p className={`fila-admin__estado ${activo ? 'oro-texto' : ''}`}>{evento.estado}</p>
      <div className="fila-admin__ventas">
        {evento.errorOfertas ? (
          <p>Entradas sin confirmar</p>
        ) : (
          <>
            <p>{evento.ofertas.length} tipos de entrada</p>
            <strong>{disponibles} disponibles</strong>
          </>
        )}
      </div>
      <div className="fila-admin__acciones">
        <Boton to={`/admin/${evento.id}`} variante="contorno" clase="boton--chico">
          Editar
        </Boton>
      </div>
    </li>
  )
}
