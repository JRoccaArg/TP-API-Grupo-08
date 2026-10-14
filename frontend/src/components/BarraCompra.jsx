import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import { cantidadItems, detalleCarrito, totalDetalle } from '../utils/carrito.js'
import { precio } from '../utils/formatos.js'

// Barra con el total de lo elegido y el botón que lleva a comprar.
export default function BarraCompra({ seleccion, hayUsuario, onComprar }) {
  const cantidad = cantidadItems(seleccion)
  const total = totalDetalle(detalleCarrito(seleccion))

  return (
    <>
      <div className="barra-compra">
        <div>
          <p className="barra-compra__rotulo">{cantidad === 1 ? '1 ENTRADA' : `${cantidad} ENTRADAS`}</p>
          <strong className="barra-compra__total oro-texto">{precio(total)}</strong>
        </div>
        <Boton onClick={onComprar} deshabilitado={cantidad === 0} clase="boton--grande">
          {hayUsuario ? 'Agregar al carrito' : 'Ingresá para comprar'} <Icono nombre="flecha" />
        </Boton>
      </div>
      <p className="barra-compra__nota">Reservamos tus entradas 15 minutos desde que las sumás al carrito.</p>
    </>
  )
}
