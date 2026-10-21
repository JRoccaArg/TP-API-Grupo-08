import AccionesEntrada from './AccionesEntrada.jsx'
import CodigoQR from './CodigoQR.jsx'
import { eventoCancelado, eventoReprogramado } from '../utils/compras.js'
import { diaMes, diaYFecha } from '../utils/fechas.js'

export default function TarjetaEntrada({ entrada, evento, comprador, numero, total }) {
  const tipo = entrada.tipo.toUpperCase()
  const esVip = entrada.tipo === 'VIP'
  const reembolsada = entrada.estado === 'CANCELADO' // el reembolso anula la entrada: su QR ya no se puede usar ni guardar

  return (
    <div>
      <article className={`tarjeta-entrada ${reembolsada ? 'tarjeta-entrada--anulada' : ''}`} style={{ animationDelay: `${(numero - 1) * 0.12}s, 0s` }}>
        <p className="tarjeta-entrada__logo">
          zenoir<span className="oro-texto">.</span>
        </p>
        <p className={`tarjeta-entrada__tipo ${esVip ? 'oro-relleno brillo' : ''}`}>INVITACIÓN {tipo}</p>
        <h2 className="tarjeta-entrada__titulo">
          Zenoir: {evento ? `${evento.titulo} ${diaMes(evento.fechaHoraInicio)}` : entrada.eventoTitulo}
        </h2>
        {evento && (
          <p className="tarjeta-entrada__fecha">
            {diaYFecha(evento.fechaHoraInicio).toUpperCase()} · {evento.locacionNombre.toUpperCase()}
          </p>
        )}
        {entrada.estado !== 'EMITIDO' && (
          <p className="tarjeta-entrada__estado">{entrada.estado === 'UTILIZADO' ? 'ENTRADA UTILIZADA' : 'ENTRADA REEMBOLSADA'}</p>
        )}
        {entrada.estado === 'EMITIDO' && eventoCancelado(evento) && <p className="tarjeta-entrada__estado">EVENTO CANCELADO</p>}
        {entrada.estado === 'EMITIDO' && eventoReprogramado(evento) && (
          <p className="tarjeta-entrada__estado tarjeta-entrada__estado--aviso">EVENTO REPROGRAMADO</p>
        )}
        <div className="tarjeta-entrada__qr">
          {reembolsada ? <span className="tarjeta-entrada__sin-qr">Sin validez</span> : <CodigoQR codigoQr={entrada.codigoQr} />}
        </div>
        <p className="tarjeta-entrada__nombre">{comprador}</p>
        <p className="tarjeta-entrada__codigo">
          {tipo} · {entrada.codigoQr.slice(0, 8).toUpperCase()} · ENTRADA {numero} DE {total}
        </p>
      </article>
      {!reembolsada && <AccionesEntrada entrada={entrada} titulo={evento ? evento.titulo : entrada.eventoTitulo} />}
    </div>
  )
}
