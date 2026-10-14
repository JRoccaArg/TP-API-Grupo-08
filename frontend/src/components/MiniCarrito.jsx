import Boton from './Boton.jsx'
import Reloj from './Reloj.jsx'
import { cantidadItems, detalleCarrito, totalDetalle } from '../utils/carrito.js'
import { precio } from '../utils/formatos.js'

// Carrito desplegable que se abre desde el header.
export default function MiniCarrito({ carrito, onCerrar }) {
  const lineas = detalleCarrito(carrito.items)

  return (
    <div className="mini-carrito aparece-rapido" role="dialog" aria-label="Tu carrito">
      <div className="mini-carrito__cabecera">
        <h2>Tu carrito</h2>
        <span>{cantidadItems(carrito.items)} entradas</span>
      </div>
      {lineas.length === 0 ? (
        <p className="mini-carrito__vacio">Todavía no sumaste entradas.</p>
      ) : (
        <>
          <p className="mini-carrito__reserva">
            Reservadas por{' '}
            <strong className="oro-texto">
              <Reloj vencimiento={carrito.vencimiento} />
            </strong>
          </p>
          <ul className="mini-carrito__lista">
            {lineas.map((linea) => (
              <li key={linea.ofertaId}>
                <img src={linea.evento.flyer} alt="" />
                <div>
                  <strong>{linea.evento.titulo}</strong>
                  <span>
                    {linea.oferta.tipoEntradaNombre} × {linea.cantidad}
                  </span>
                </div>
                <b>{precio(linea.subtotal)}</b>
              </li>
            ))}
          </ul>
          <p className="mini-carrito__total">
            <span>TOTAL</span>
            <strong className="oro-texto">{precio(totalDetalle(lineas))}</strong>
          </p>
          <div className="mini-carrito__acciones">
            <Boton to="/carrito" variante="contorno" onClick={onCerrar}>
              Ver carrito
            </Boton>
            <Boton to="/pago" onClick={onCerrar}>
              Ir a pagar
            </Boton>
          </div>
        </>
      )}
    </div>
  )
}
