import SelectorCantidad from './SelectorCantidad.jsx'
import { fechaCorta } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'
import { estadoOferta } from '../utils/eventos.js'

const AVISOS = {
  AGOTADO: 'Stock agotado.', PAUSADO: 'Venta pausada.', FINALIZADO: 'Venta finalizada.',
  CANCELADO: 'Evento cancelado.', REPROGRAMADO: 'Evento reprogramado.',
}

export default function FilaEntrada({ oferta, evento, cantidad, onCambiar, ahora }) {
  const estadoVenta = estadoOferta(oferta, evento, ahora)
  const conPrecio = Number.isFinite(oferta.precioFinal)
  const conDescuento = oferta.porcentajeDescuento > 0 && Number.isFinite(oferta.precio)
  return (
    <li className={`fila-entrada ${cantidad > 0 ? 'fila-entrada--elegida' : ''} fila-entrada--${estadoVenta}`}>
      <div className="fila-entrada__datos">
        <h3>{oferta.tipoEntradaNombre}
          {conDescuento && <span className="fila-entrada__descuento oro-texto">−{oferta.porcentajeDescuento}%</span>}
        </h3>
        <p>{estadoVenta === 'EN_VENTA' ? `${oferta.cantidadDisponible} disponibles` : 'Disponibilidad sujeta al estado de venta'}</p>
        {oferta.fechaFinVenta && <p>Venta hasta {fechaCorta(oferta.fechaFinVenta)}</p>}
      </div>
      <div className="fila-entrada__precio">
        {conDescuento && <s>{precio(oferta.precio)}</s>}
        <strong className={cantidad > 0 ? 'oro-texto' : ''}>{conPrecio ? precio(oferta.precioFinal) : 'Sin precio'}</strong>
      </div>
      {estadoVenta === 'EN_VENTA' ? (
        <SelectorCantidad cantidad={cantidad} nombre={oferta.tipoEntradaNombre} maximo={oferta.cantidadDisponible}
          onCambiar={(nueva) => onCambiar(oferta.id, nueva)} />
      ) : (
        <p className="fila-entrada__aviso">{estadoVenta === 'PROXIMAMENTE'
          ? `Venta desde ${fechaCorta(oferta.fechaInicioVenta)}` : AVISOS[estadoVenta] || 'Venta no disponible.'}</p>
      )}
    </li>
  )
}
