import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { cantidadItems } from '../utils/carrito.js'
import { precio } from '../utils/formatos.js'

// Cuadro lateral del pago con el detalle, el total y el botón "Pagar".
// Sin onPagar el cobro todavía no está conectado al backend: el botón queda deshabilitado (no se simula un pago).
export default function TotalPago({ carrito, pagando = false, onPagar }) {
  const total = precio(carrito.total)

  return (
    <aside className="resumen" aria-label="Total">
      <p className="rotulo">TOTAL A PAGAR</p>
      <strong className="resumen__gran-total oro-texto">{total}</strong>
      <p className="resumen__nota">{cantidadItems(carrito)} entradas · Precio final, sin cargos</p>
      <ul className="resumen__lista resumen__lista--separada">
        {carrito.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.eventoTitulo} · {item.tipoEntradaNombre} × {item.cantidad}
            </span>
            <span>{precio(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      <Boton onClick={onPagar} deshabilitado={pagando || !onPagar} clase="boton--ancho boton--grande">
        {!onPagar ? 'El cobro todavía no está habilitado' : pagando ? 'Procesando...' : `Pagar ${total}`}
      </Boton>
      <p className="resumen__nota resumen__nota--icono">
        <Icono nombre="candado" tamano={16} />
        Pago de demostración: no se realizan cobros reales ni se guardan los datos de la tarjeta.
      </p>
      <p className="resumen__nota">Al pagar emitimos tus entradas con su código QR.</p>
    </aside>
  )
}
