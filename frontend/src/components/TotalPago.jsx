import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { cantidadItems, totalDetalle } from '../utils/carrito.js'
import { precio } from '../utils/formatos.js'

// Cuadro lateral del pago con el detalle, el total y el botón "Pagar".
export default function TotalPago({ lineas, items, pagando, onPagar }) {
  const total = precio(totalDetalle(lineas))

  return (
    <aside className="resumen" aria-label="Total">
      <p className="rotulo">TOTAL A PAGAR</p>
      <strong className="resumen__gran-total oro-texto">{total}</strong>
      <p className="resumen__nota">{cantidadItems(items)} entradas · Precio final, sin cargos</p>
      <ul className="resumen__lista resumen__lista--separada">
        {lineas.map((linea) => (
          <li key={linea.ofertaId}>
            <span>
              {linea.evento.titulo} · {linea.oferta.tipoEntradaNombre} × {linea.cantidad}
            </span>
            <span>{precio(linea.subtotal)}</span>
          </li>
        ))}
      </ul>
      <Boton onClick={onPagar} deshabilitado={pagando} clase="boton--ancho boton--grande">
        {pagando ? 'Procesando...' : `Pagar ${total}`}
      </Boton>
      <p className="resumen__nota resumen__nota--icono">
        <Icono nombre="candado" tamano={16} />
        Pago de demostración: no se realizan cobros reales ni se guardan los datos de la tarjeta.
      </p>
      <p className="resumen__nota">Al pagar emitimos tus entradas con su código QR.</p>
    </aside>
  )
}
