import Reloj from './Reloj.jsx'

export default function BannerReserva({ vencimiento, mensaje }) {
  return (
    <div className="reserva" role="timer" aria-label="Tiempo restante de la reserva">
      <p>{mensaje}</p>
      <strong className="reserva__tiempo oro-texto">
        <Reloj vencimiento={vencimiento} />
      </strong>
      <span className="reserva__barra oro-relleno" aria-hidden="true" />
    </div>
  )
}
