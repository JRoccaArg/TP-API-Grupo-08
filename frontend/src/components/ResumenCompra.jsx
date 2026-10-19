import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { totalDetalle } from '../utils/carrito.js'
import { precio } from '../utils/formatos.js'

// Cuadro lateral del carrito: renglones, total y botón para ir a pagar.
export default function ResumenCompra({ lineas, onIrAPagar }) {
  return (
    <aside className="resumen" aria-label="Resumen">
      <p className="rotulo">RESUMEN</p>
      <ul className="resumen__lista">
        {lineas.map((linea) => (
          <li key={linea.ofertaId}>
            <span>
              {linea.oferta.tipoEntradaNombre} × {linea.cantidad}
            </span>
            <span>{precio(linea.subtotal)}</span>
          </li>
        ))}
        <li>
          <span>Cargos de servicio</span>
          <span className="resumen__oro">Sin cargos</span>
        </li>
      </ul>
      <p className="resumen__total">
        <span className="rotulo">TOTAL</span>
        <strong className="oro-texto">{precio(totalDetalle(lineas))}</strong>
      </p>
      <Boton to="/pago" onClick={onIrAPagar} clase="boton--ancho boton--grande">
        Ir a pagar <Icono nombre="flecha" />
      </Boton>
      <p className="resumen__nota">Al continuar abrís el pago y tenés 15 minutos más para completarlo.</p>
    </aside>
  )
}
