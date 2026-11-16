import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { precio } from '../utils/formatos.js'

// "Ir a pagar" solo lleva a /pago: esa pantalla le pide al back que abra el pago
export default function ResumenCompra({ carrito }) {
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
      <Boton to="/pago" clase="boton--ancho boton--grande">
        Ir a pagar <Icono nombre="flecha" />
      </Boton>
      <p className="resumen__nota">
        {carrito.estado === 'EN_PAGO'
          ? 'Ya abriste el pago: el tiempo sigue corriendo desde la primera vez y no se reinicia.'
          : 'Al continuar abrís el pago y tenés 15 minutos más para completarlo.'}
      </p>
    </aside>
  )
}
