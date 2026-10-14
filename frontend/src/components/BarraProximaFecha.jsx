import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { cuentaRegresiva, fechaCorta, horario } from '../utils/fechas.js'
import { dos } from '../utils/formatos.js'

// Franja al pie del hero con la próxima fecha y cuánto falta.
export default function BarraProximaFecha({ evento }) {
  const { dias, horas, minutos } = cuentaRegresiva(evento.fechaHoraInicio)

  return (
    <div className="barra-fecha">
      <p className="barra-fecha__rotulo">
        Próxima
        <br />
        fecha
      </p>
      <h2 className="barra-fecha__nombre">{evento.titulo}</h2>
      <div className="barra-fecha__celda">
        <strong>{fechaCorta(evento.fechaHoraInicio)}</strong>
        <span>
          {horario(evento.fechaHoraInicio, evento.fechaHoraFin)} · {evento.locacionNombre}
        </span>
      </div>
      <div className="barra-fecha__celda">
        <strong>
          {dos(dias)} : {dos(horas)} : {dos(minutos)}
        </strong>
        <span className="barra-fecha__unidades">DÍAS · HORAS · MIN</span>
      </div>
      <Boton to={`/eventos/${evento.id}`} clase="barra-fecha__boton">
        Elegir entradas <Icono nombre="diagonal" tamano={18} />
      </Boton>
    </div>
  )
}
