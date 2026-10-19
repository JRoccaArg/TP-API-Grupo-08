import Boton from './Boton.jsx'
import CodigoQR from './CodigoQR.jsx'
import { diaMes, diaYFecha } from '../utils/fechas.js'

// Entrada con QR lista para mostrar en la puerta. Solo muestra datos: no decide nada.
export default function TarjetaEntrada({ entrada, evento, comprador, numero, total }) {
  const tipo = entrada.tipo.toUpperCase()
  const esVip = entrada.tipo === 'VIP'

  return (
    <div>
      <article className="tarjeta-entrada" style={{ animationDelay: `${(numero - 1) * 0.12}s, 0s` }}>
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
          <p className="tarjeta-entrada__estado">{entrada.estado === 'UTILIZADO' ? 'ENTRADA UTILIZADA' : 'ENTRADA CANCELADA'}</p>
        )}
        <div className="tarjeta-entrada__qr">
          <CodigoQR codigoQr={entrada.codigoQr} />
        </div>
        <p className="tarjeta-entrada__nombre">{comprador}</p>
        <p className="tarjeta-entrada__codigo">
          {tipo} · {entrada.codigoQr.slice(0, 8).toUpperCase()} · ENTRADA {numero} DE {total}
        </p>
      </article>
      <div className="tarjeta-entrada__acciones">
        <Boton>Descargar</Boton>
        <Boton variante="oscuro">Compartir</Boton>
      </div>
    </div>
  )
}
