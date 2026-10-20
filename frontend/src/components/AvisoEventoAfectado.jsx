import { useState } from 'react'
import Boton from './Boton.jsx'
import { reembolsarCompra } from '../utils/apiCompras.js'
import { cantidadDeEntradas, comprasDelEvento, eventoCancelado, permiteReembolso, sePuedeReembolsar } from '../utils/compras.js'
import { diaYFecha, horario } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'

// Lo que se ve en "Mis entradas" de un evento cancelado o reprogramado: qué pasó y, por cada compra de ese evento, el
// reembolso. Pedirlo deja la compra reembolsada en el back (anula sus entradas y devuelve el stock); la devolución del dinero
// es una demostración: no se mueve plata. No se puede deshacer: el primer clic pide confirmación y el segundo lo pide.
// "onReembolsada" recibe la compra que respondió el back, para acomodarla en la lista.
export default function AvisoEventoAfectado({ evento, compras, eventos, token, onReembolsada }) {
  const [confirmando, setConfirmando] = useState(null)
  const [pidiendo, setPidiendo] = useState(null)
  const [error, setError] = useState('')
  const cancelado = eventoCancelado(evento)
  const delEvento = comprasDelEvento(compras, evento.id)
  const hayConfirmadas = delEvento.some((compra) => compra.estado === 'CONFIRMADA')
  const hayPendientes = permiteReembolso(evento) && hayConfirmadas

  const pedir = (id) => {
    if (confirmando !== id) {
      setConfirmando(id)
      return
    }
    setConfirmando(null)
    setPidiendo(id)
    setError('')
    reembolsarCompra(token, id)
      .then(onReembolsada)
      .catch((fallo) => setError(fallo.message))
      .then(() => setPidiendo(null))
  }

  return (
    <section className={`evento-cancelado ${cancelado ? '' : 'evento-cancelado--reprogramado'}`} aria-label={cancelado ? 'Evento cancelado' : 'Evento reprogramado'}>
      <p className="evento-cancelado__titulo">{cancelado ? 'Este evento fue cancelado.' : 'Este evento fue reprogramado.'}</p>
      {!cancelado && hayConfirmadas && (
        <p>
          Tus entradas siguen siendo válidas. Nueva fecha: {diaYFecha(evento.fechaHoraInicio)} · {horario(evento.fechaHoraInicio, evento.fechaHoraFin)}.
        </p>
      )}
      {hayPendientes && <p>{cancelado ? 'Podés pedir el reembolso de tu compra.' : 'Si no podés asistir, podés pedir el reembolso.'}</p>}
      <ul>
        {delEvento.filter((compra) => compra.estado === 'CANCELADA' || permiteReembolso(evento)).map((compra) => {
          const cantidad = cantidadDeEntradas(compra)
          return (
            <li key={compra.id}>
              <span>
                Compra N.º {compra.id} · {cantidad} {cantidad === 1 ? 'entrada' : 'entradas'} · {precio(compra.total)}
              </span>
              {compra.estado === 'CANCELADA' ? (
                <b>Reembolso de {precio(compra.total)} pedido (demostración: no se mueve dinero)</b>
              ) : sePuedeReembolsar(compra, eventos) ? (
                <Boton variante="contorno" clase="boton--chico" deshabilitado={pidiendo === compra.id} onClick={() => pedir(compra.id)}>
                  {pidiendo === compra.id ? 'Pidiendo…' : confirmando === compra.id ? `Confirmar: reembolsar ${precio(compra.total)}` : 'Pedir reembolso'}
                </Boton>
              ) : (
                <small>Incluye otros eventos que siguen en pie: no se puede reembolsar.</small>
              )}
            </li>
          )
        })}
      </ul>
      {error && <p className="evento-cancelado__error" role="alert">{error}</p>}
    </section>
  )
}
