import { useState } from 'react'
import Icono from './Icono.jsx'
import MiniCarrito from './MiniCarrito.jsx'
import Reloj from './Reloj.jsx'
import { cantidadItems } from '../utils/carrito.js'

// Botón del carrito del header: siempre en el mismo lugar, con la cantidad y el tiempo de reserva.
export default function CarritoChip({ carrito }) {
  const [abierto, setAbierto] = useState(false)
  const cantidad = cantidadItems(carrito.items)

  return (
    <div className="carrito-chip">
      <button
        type="button"
        className="carrito-chip__boton"
        aria-expanded={abierto}
        aria-label={`Carrito: ${cantidad} entradas`}
        onClick={() => setAbierto(!abierto)}
      >
        <Icono nombre="bolsa" tamano={24} grosor={1.6} />
        {cantidad > 0 && <span className="carrito-chip__cuenta oro-relleno">{cantidad}</span>}
        {cantidad > 0 && (
          <span className="carrito-chip__reloj">
            <Reloj vencimiento={carrito.vencimiento} />
          </span>
        )}
      </button>
      {abierto && <MiniCarrito carrito={carrito} onCerrar={() => setAbierto(false)} />}
    </div>
  )
}
