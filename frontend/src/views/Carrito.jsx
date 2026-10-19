import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import BannerReserva from '../components/BannerReserva.jsx'
import LineaCarrito from '../components/LineaCarrito.jsx'
import PasosCompra from '../components/PasosCompra.jsx'
import ResumenCompra from '../components/ResumenCompra.jsx'
import { detalleCarrito } from '../utils/carrito.js'

// Pantalla "/carrito": paso 2 de la compra.
export default function Carrito({ usuario, carrito, vencido, onCambiar, onVaciar, onIrAPagar }) {
  const lineas = detalleCarrito(carrito.items)

  if (usuario?.rol !== 'USER') {
    return <Aviso mensaje="Ingresá para ver tu carrito." boton="Ingresar" to="/login" />
  }
  if (vencido) return <Aviso mensaje="Se terminó el tiempo y liberamos tus entradas." boton="Ver fechas" to="/" />
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
            <Boton to="/" variante="contorno" clase="boton--chico">
              Seguir comprando
            </Boton>
            <Boton variante="peligro" clase="boton--chico" onClick={onVaciar}>
              Vaciar carrito
            </Boton>
          </div>
        </section>
        <ResumenCompra lineas={lineas} onIrAPagar={onIrAPagar} />
      </div>
    </main>
  )
}
