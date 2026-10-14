import SelectorCantidad from './SelectorCantidad.jsx'
import { fechaCorta } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'

// Qué se muestra a la derecha de la fila según el estado de venta.
// Es un objeto en vez de varios if: para sumar un estado nuevo solo se agrega una entrada (patrón Strategy).
const ACCIONES = {
  EN_VENTA: ({ oferta, cantidad, onCambiar }) => (
    <SelectorCantidad
      cantidad={cantidad}
      nombre={oferta.tipoEntradaNombre}
      maximo={Math.min(10, oferta.cantidadDisponible)}
      onCambiar={(nueva) => onCambiar(oferta.id, nueva)}
    />
  ),
  AGOTADO: () => <p className="fila-entrada__aviso">Stock agotado.</p>,
  PROXIMAMENTE: ({ oferta }) => (
    <p className="fila-entrada__aviso">
      Venta desde
      <br />
      <strong>{fechaCorta(oferta.fechaInicioVenta)}</strong>
    </p>
  ),
}

export default function FilaEntrada({ oferta, cantidad, onCambiar }) {
  const Accion = ACCIONES[oferta.estadoVenta]
  const conDescuento = oferta.porcentajeDescuento > 0
  const clases = `fila-entrada ${cantidad > 0 ? 'fila-entrada--elegida' : ''} fila-entrada--${oferta.estadoVenta}`

  return (
    <li className={clases}>
      <div className="fila-entrada__datos">
        <h3>
          {oferta.tipoEntradaNombre}
          {conDescuento && <span className="fila-entrada__descuento oro-texto">−{oferta.porcentajeDescuento}%</span>}
        </h3>
        <p>{oferta.descripcion}</p>
      </div>
      <div className="fila-entrada__precio">
        {conDescuento && <s>{precio(oferta.precio)}</s>}
        <strong className={cantidad > 0 ? 'oro-texto' : ''}>{precio(oferta.precioFinal)}</strong>
      </div>
      <Accion oferta={oferta} cantidad={cantidad} onCambiar={onCambiar} />
    </li>
  )
}
