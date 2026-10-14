import { Link } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import BannerReserva from '../components/BannerReserva.jsx'
import LineaCarrito from '../components/LineaCarrito.jsx'
import PasosCompra from '../components/PasosCompra.jsx'
import ResumenCompra from '../components/ResumenCompra.jsx'
import { detalleCarrito } from '../utils/carrito.js'

// Pantalla "/carrito": paso 2 de la compra.
export default function Carrito({ usuario, carrito, onCambiar, onVaciar }) {
  const lineas = detalleCarrito(carrito.items)

  if (usuario?.rol !== 'USER') {
    return <Aviso mensaje="Ingresá para ver tu carrito." boton="Ingresar" to="/login" />
  }
  if (lineas.length === 0) return <Aviso mensaje="Tu carrito está vacío." boton="Ver fechas" to="/" />

  return (
    <main className="pagina compra">
      <PasosCompra paso={2} />
      <BannerReserva
        vencimiento={carrito.vencimiento}
        mensaje="Tus entradas están reservadas. Si se termina el tiempo, las liberamos."
      />
      <div className="compra__grilla">
        <section>
          <h1 className="titulo-pagina aparece">Tu carrito</h1>
          <ul className="lineas">
            {lineas.map((linea) => (
              <LineaCarrito key={linea.ofertaId} linea={linea} onCambiar={onCambiar} />
            ))}
          </ul>
          <div className="compra__acciones">
            <Link to="/" className="enlace-oro">
              Seguir comprando
            </Link>
            <button type="button" className="compra__vaciar" onClick={onVaciar}>
              Vaciar carrito
            </button>
          </div>
        </section>
        <ResumenCompra lineas={lineas} />
      </div>
    </main>
  )
}
