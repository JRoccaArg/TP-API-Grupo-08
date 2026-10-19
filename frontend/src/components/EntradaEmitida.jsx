import QRMarcador from './QRMarcador.jsx'
import { diaYFecha, horario } from '../utils/fechas.js'

// Entrada de la pantalla "Compra confirmada": datos del evento arriba y QR abajo. Solo muestra datos.
export default function EntradaEmitida({ entrada, evento }) {
  return (
    <li className="emitida">
      <div className="emitida__datos">
        <div className="emitida__cabecera">
          <h2>{evento ? evento.titulo : entrada.eventoTitulo}</h2>
          <span className="emitida__tipo">{entrada.tipo.toUpperCase()}</span>
        </div>
        {evento && (
          <p>
            {diaYFecha(evento.fechaHoraInicio)} · {horario(evento.fechaHoraInicio, evento.fechaHoraFin)}
            <br />
            {evento.locacionNombre}
          </p>
        )}
      </div>
      <div className="emitida__corte" aria-hidden="true" />
      <div className="emitida__qr">
        <QRMarcador lado={150} />
        <p>{entrada.codigoQr.slice(0, 8).toUpperCase()}</p>
        <span className="emitida__estado">EMITIDA</span>
      </div>
    </li>
  )
}
