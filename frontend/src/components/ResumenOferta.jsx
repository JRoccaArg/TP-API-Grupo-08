import { fechaCorta } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'

// Una entrada ya cargada en el evento, con sus datos y las acciones de editar o quitar.
export default function ResumenOferta({ oferta }) {
  const agotada = oferta.estadoVenta === 'AGOTADO'
  const descuento =
    oferta.porcentajeDescuento > 0 ? `${oferta.porcentajeDescuento}% de descuento` : 'sin descuento'

  return (
    <li className="oferta-admin">
      <div className="oferta-admin__titulo">
        <h3>{oferta.tipoEntradaNombre}</h3>
        <span className={agotada ? '' : 'oro-texto'}>{agotada ? 'AGOTADO' : 'ACTIVO'}</span>
      </div>
      <p>
        {precio(oferta.precio)} · {descuento} · {oferta.cantidadDisponible} entradas
      </p>
      <p className="oferta-admin__venta">Venta desde {fechaCorta(oferta.fechaInicioVenta)}</p>
      <div className="oferta-admin__acciones">
        <button type="button">Editar</button>
        <button type="button" className="oferta-admin__quitar">
          Quitar
        </button>
      </div>
    </li>
  )
}
