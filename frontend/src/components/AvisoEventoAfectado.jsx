import { useState } from 'react'
import Boton from './Boton.jsx'
import { reembolsarEvento } from '../utils/apiCompras.js'
import { comprasDelEvento, eventoCancelado, resumenDelEvento } from '../utils/compras.js'
import { diaYFecha, horario } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'

// Lo que se ve en "Mis entradas" de un evento cancelado o reprogramado: qué pasó y, por cada compra con entradas de ese evento,
// el reembolso. Se reembolsan solo las entradas de ESTE evento (la compra puede tener otros): quedan anuladas y el stock vuelve; una
// ya usada no se reembolsa. La devolución del dinero es una demostración: no se mueve plata. No se puede deshacer: el primer clic
// pide confirmación y el segundo lo pide. "onReembolsada" recibe la compra que respondió el back, para acomodarla en la lista.
export default function AvisoEventoAfectado({ evento, compras, token, onReembolsada }) {
  const [confirmando, setConfirmando] = useState(null)
  const [pidiendo, setPidiendo] = useState(null)
  const [error, setError] = useState('')
  const cancelado = eventoCancelado(evento)
  const resumenes = comprasDelEvento(compras, evento.id).map((compra) => ({ compra, ...resumenDelEvento(compra, evento.id) }))
  const hayVigentes = resumenes.some((resumen) => resumen.emitidas > 0)

  const pedir = (id) => {
    if (confirmando !== id) {
      setConfirmando(id)
      return
    }
    setConfirmando(null)
    setPidiendo(id)
    setError('')
    reembolsarEvento(token, id, evento.id)
      .then(onReembolsada)
      .catch((fallo) => setError(fallo.message))
      .then(() => setPidiendo(null))
  }

  return (
    <section className={`evento-cancelado ${cancelado ? '' : 'evento-cancelado--reprogramado'}`} aria-label={cancelado ? 'Evento cancelado' : 'Evento reprogramado'}>
      <p className="evento-cancelado__titulo">{cancelado ? 'Este evento fue cancelado.' : 'Este evento fue reprogramado.'}</p>
      {!cancelado && hayVigentes && (
        <p>
          Tus entradas siguen siendo válidas. Nueva fecha: {diaYFecha(evento.fechaHoraInicio)} · {horario(evento.fechaHoraInicio, evento.fechaHoraFin)}.
        </p>
      )}
      {hayVigentes && <p>{cancelado ? 'Podés pedir el reembolso de tus entradas de este evento.' : 'Si no podés asistir, podés pedir el reembolso.'}</p>}
      <ul>
        {resumenes.map(({ compra, total, emitidas, reembolsadas, usadas, montoEmitidas, montoReembolsadas }) => (
          <li key={compra.id}>
            <span>
              Compra N.º {compra.id} · {total} {total === 1 ? 'entrada' : 'entradas'} de este evento
            </span>
            {emitidas > 0 ? (
              <Boton variante="contorno" clase="boton--chico" deshabilitado={pidiendo === compra.id} onClick={() => pedir(compra.id)}>
                {pidiendo === compra.id ? 'Pidiendo…' : confirmando === compra.id ? `Confirmar: reembolsar ${precio(montoEmitidas)}` : `Pedir reembolso de ${precio(montoEmitidas)}`}
              </Boton>
            ) : reembolsadas > 0 ? (
              <b>Reembolso de {precio(montoReembolsadas)} pedido (demostración: no se mueve dinero)</b>
            ) : (
              <small>Ya usaste estas entradas: no se pueden reembolsar.</small>
            )}
            {usadas > 0 && reembolsadas + emitidas > 0 && (
              <small>{usadas === 1 ? 'Una entrada ya se usó y no se reembolsa.' : `${usadas} entradas ya se usaron y no se reembolsan.`}</small>
            )}
          </li>
        ))}
      </ul>
      {error && <p className="evento-cancelado__error" role="alert">{error}</p>}
    </section>
  )
}
