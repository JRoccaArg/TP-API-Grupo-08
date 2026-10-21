import { useEffect, useState } from 'react'
import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { cuentaRegresiva, fechaApi, fechaCorta, horario } from '../utils/fechas.js'
import { dos } from '../utils/formatos.js'

export default function BarraProximaFecha({ evento, origen }) {
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(intervalo)
  }, [])
  const { dias, horas, minutos } = cuentaRegresiva(evento.fechaHoraInicio, ahora)
  const enCurso = fechaApi(evento.fechaHoraInicio) <= ahora // ya empezó y todavía no terminó

  return (
    <div className="barra-fecha">
      <p className="barra-fecha__rotulo">
        {enCurso ? 'Ocurre' : 'Próxima'}
        <br />
        {enCurso ? 'ahora' : 'fecha'}
      </p>
      <h2 className="barra-fecha__nombre" title={evento.titulo}>
        <span>{evento.titulo}</span>
      </h2>
      <div className="barra-fecha__celda">
        <strong>{fechaCorta(evento.fechaHoraInicio)}</strong>
        <span title={evento.locacionNombre}>
          {horario(evento.fechaHoraInicio, evento.fechaHoraFin)} · {evento.locacionNombre}
        </span>
      </div>
      <div className="barra-fecha__celda">
        {enCurso ? (
          <>
            <strong>EN CURSO</strong>
            <span className="barra-fecha__unidades">YA EMPEZÓ</span>
          </>
        ) : (
          <>
            <strong>
              {dos(dias)} : {dos(horas)} : {dos(minutos)}
            </strong>
            <span className="barra-fecha__unidades">DÍAS · HORAS · MIN</span>
          </>
        )}
      </div>
      <Boton to={`/eventos/${evento.id}`} state={origen} clase="barra-fecha__boton">
        Elegir entradas <Icono nombre="diagonal" tamano={18} />
      </Boton>
    </div>
  )
}
