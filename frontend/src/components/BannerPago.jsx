import { useEffect, useState } from 'react'
import { QUINCE_MINUTOS } from '../utils/carrito.js'
import { formatearTiempo } from '../utils/formatos.js'

const DOS_MINUTOS = 2 * 60 * 1000

// Franja del pago: cuenta regresiva y barra que se va vaciando. En los últimos 2 minutos pasa a rojo.
export default function BannerPago({ vencimiento }) {
  const [restante, setRestante] = useState(QUINCE_MINUTOS)

  useEffect(() => {
    const actualizar = () => setRestante(Math.max(0, vencimiento - Date.now()))
    actualizar()
    const intervalo = setInterval(actualizar, 1000)
    return () => clearInterval(intervalo)
  }, [vencimiento])

  const urgente = restante <= DOS_MINUTOS

  return (
    <div className={`reserva ${urgente ? 'reserva--urgente' : ''}`} role="timer" aria-label="Tiempo restante para pagar">
      <p>Tenés tiempo para completar el pago. Si se termina, liberamos las entradas.</p>
      <strong className={`reserva__tiempo ${urgente ? '' : 'oro-texto'}`}>{formatearTiempo(restante)}</strong>
      <span className="reserva__progreso" style={{ width: `${(restante / QUINCE_MINUTOS) * 100}%` }} aria-hidden="true" />
    </div>
  )
}
