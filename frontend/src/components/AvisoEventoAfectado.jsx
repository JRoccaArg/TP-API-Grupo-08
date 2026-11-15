import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Boton from './Boton.jsx'
import { reembolsarEvento } from '../redux/comprasSlice'
import { comprasDelEvento, eventoCancelado, resumenDelEvento } from '../utils/compras.js'
import { diaYFecha, horario } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'

// Lo que se ve en "Mis entradas" de un evento cancelado o reprogramado: qué pasó y, por cada compra con entradas de ese evento, el reembolso.
// Se reembolsan solo las de ESTE evento: quedan anuladas y vuelve el stock; las usadas no. El dinero es de demostración.
// No se puede deshacer: el primer clic pide confirmación y el segundo despacha. La compra que responde el back reemplaza a la anterior en el store.
export default function AvisoEventoAfectado({ evento, compras, token }) {
  const dispatch = useDispatch()
  const { reembolsando, errorReembolso } = useSelector((state) => state.compras)
  const [confirmando, setConfirmando] = useState(null)
  const cancelado = eventoCancelado(evento)
  const resumenes = comprasDelEvento(compras, evento.id).map((compra) => ({ compra, ...resumenDelEvento(compra, evento.id) }))
  const hayVigentes = resumenes.some((resumen) => resumen.emitidas > 0)

  const pedir = (id) => {
    if (confirmando !== id) {
      setConfirmando(id)
      return
    }
    setConfirmando(null)
    dispatch(reembolsarEvento({ token, compraId: id, eventoId: evento.id }))
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
              <Boton variante="contorno" clase="boton--chico" deshabilitado={reembolsando === compra.id} onClick={() => pedir(compra.id)}>
                {reembolsando === compra.id ? 'Pidiendo…' : confirmando === compra.id ? `Confirmar: reembolsar ${precio(montoEmitidas)}` : `Pedir reembolso de ${precio(montoEmitidas)}`}
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
      {errorReembolso && <p className="evento-cancelado__error" role="alert">{errorReembolso}</p>}
    </section>
  )
}
