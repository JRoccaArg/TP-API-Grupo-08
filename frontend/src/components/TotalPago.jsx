import Boton from './Boton.jsx'
import { cantidadItems, totalDetalle } from '../utils/carrito.js'
import { precio } from '../utils/formatos.js'

// Cuadro lateral del pago con el total y el botón "Pagar".
export default function TotalPago({ lineas, items, onPagar }) {
  const total = precio(totalDetalle(lineas))

  return (
    <aside className="resumen" aria-label="Total">
      <p className="rotulo">TOTAL A PAGAR</p>
      <strong className="resumen__gran-total oro-texto">{total}</strong>
      <p className="resumen__nota">{cantidadItems(items)} entradas · Precio final, sin cargos</p>
      <Boton onClick={onPagar} clase="boton--ancho boton--grande">
        Pagar {total}
      </Boton>
      <p className="resumen__nota">Al pagar emitimos tus entradas con su código QR.</p>
    </aside>
  )
}
