import Icono from './Icono.jsx'
import IrAPagar from './IrAPagar.jsx'
import { precio } from '../utils/formatos.js'

// Cuadro lateral del carrito: renglones, total y botón para ir a pagar.
export default function ResumenCompra({ carrito, onIrAPagar }) {
  return (
    <aside className="resumen" aria-label="Resumen">
      <p className="rotulo">RESUMEN</p>
      <ul className="resumen__lista">
        {carrito.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.tipoEntradaNombre} × {item.cantidad}
            </span>
            <span>{precio(item.subtotal)}</span>
          </li>
        ))}
        <li>
          <span>Cargos de servicio</span>
          <span className="resumen__oro">Sin cargos</span>
        </li>
      </ul>
      <p className="resumen__total">
        <span className="rotulo">TOTAL</span>
        <strong className="oro-texto">{precio(carrito.total)}</strong>
      </p>
      <IrAPagar onIrAPagar={onIrAPagar} clase="boton--ancho boton--grande">
        Ir a pagar <Icono nombre="flecha" />
      </IrAPagar>
      <p className="resumen__nota">Al continuar abrís el pago y tenés 15 minutos más para completarlo.</p>
    </aside>
  )
}
