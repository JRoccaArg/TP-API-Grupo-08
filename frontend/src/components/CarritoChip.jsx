import { useState } from 'react'
import { useSelector } from 'react-redux'
import Icono from './Icono.jsx'
import MiniCarrito from './MiniCarrito.jsx'
import Reloj from './Reloj.jsx'
import { cantidadItems, idsDeEventos, vencimientoMs } from '../utils/carrito.js'
import { eventosConFotos } from '../utils/fotos.js'

// El carrito del header: lee el carrito y sus eventos del store, así se actualiza solo cuando se agrega o se quita algo
export default function CarritoChip() {
  const { carrito } = useSelector((state) => state.carrito)
  const { items } = useSelector((state) => state.eventos)
  const [abierto, setAbierto] = useState(false)
  const cantidad = cantidadItems(carrito)

  return (
    <div className={`carrito-chip ${abierto ? 'carrito-chip--abierto' : ''}`}>
      <button
        type="button"
        className="carrito-chip__boton"
        aria-expanded={abierto}
        aria-label={`Carrito: ${cantidad} ${cantidad === 1 ? 'entrada' : 'entradas'}`}
        onClick={() => setAbierto(!abierto)}
      >
        <Icono nombre="carrito" tamano={24} grosor={1.6} />
        {cantidad > 0 && <span className="carrito-chip__cuenta oro-relleno">{cantidad}</span>}
        {cantidad > 0 && (
          <span className="carrito-chip__reloj">
            <Reloj vencimiento={vencimientoMs(carrito)} />
          </span>
        )}
      </button>
      {abierto && (
        <MiniCarrito carrito={carrito} eventos={eventosConFotos(items, idsDeEventos(carrito))} onCerrar={() => setAbierto(false)} />
      )}
    </div>
  )
}
