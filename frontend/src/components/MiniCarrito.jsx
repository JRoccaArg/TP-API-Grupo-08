import Boton from './Boton.jsx'
import IrAPagar from './IrAPagar.jsx'
import Reloj from './Reloj.jsx'
import { cantidadItems, vencimientoMs } from '../utils/carrito.js'
import { precio } from '../utils/formatos.js'

export default function MiniCarrito({ carrito, eventos, onCerrar, onIrAPagar }) {
  return (
    <div className="mini-carrito aparece-rapido" role="dialog" aria-label="Tu carrito">
      <div className="mini-carrito__cabecera">
        <h2>Tu carrito</h2>
        <span>{cantidadItems(carrito)} entradas</span>
      </div>
      {carrito.items.length === 0 ? (
        <p className="mini-carrito__vacio">Todavía no sumaste entradas.</p>
      ) : (
        <>
          <p className="mini-carrito__reserva">
            Reservadas por{' '}
            <strong className="oro-texto">
              <Reloj vencimiento={vencimientoMs(carrito)} />
            </strong>
          </p>
          <ul className="mini-carrito__lista">
            {carrito.items.map((item) => {
              const portada = eventos[item.eventoId]?.imagenes?.[0]
              return (
                <li key={item.id}>
                  {portada ? <img src={portada.url} alt="" /> : <span className="mini-carrito__sin-foto" aria-hidden="true" />}
                  <div>
                    <strong>{item.eventoTitulo}</strong>
                    <span>
                      {item.tipoEntradaNombre} × {item.cantidad}
                    </span>
                  </div>
                  <b>{precio(item.subtotal)}</b>
                </li>
              )
            })}
          </ul>
          <p className="mini-carrito__total">
            <span>TOTAL</span>
            <strong className="oro-texto">{precio(carrito.total)}</strong>
          </p>
          <div className="mini-carrito__acciones">
            <Boton to="/carrito" variante="contorno" onClick={onCerrar}>
              Ver carrito
            </Boton>
            <IrAPagar onIrAPagar={onIrAPagar} onTerminar={onCerrar}>
              Ir a pagar
            </IrAPagar>
          </div>
        </>
      )}
    </div>
  )
}
