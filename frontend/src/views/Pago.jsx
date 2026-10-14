import { useNavigate } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import BannerReserva from '../components/BannerReserva.jsx'
import DatosPago from '../components/DatosPago.jsx'
import ListaCompra from '../components/ListaCompra.jsx'
import PasosCompra from '../components/PasosCompra.jsx'
import TotalPago from '../components/TotalPago.jsx'
import { detalleCarrito } from '../utils/carrito.js'

// Pantalla "/pago": paso 3. El pago es simulado: "Pagar" vacía el carrito y lleva a Mis entradas.
export default function Pago({ usuario, carrito, onPagar }) {
  const navigate = useNavigate()
  const lineas = detalleCarrito(carrito.items)

  if (usuario?.rol !== 'USER') {
    return <Aviso mensaje="Ingresá para pagar tus entradas." boton="Ingresar" to="/login" />
  }
  if (lineas.length === 0) return <Aviso mensaje="No hay nada para pagar." boton="Ver fechas" to="/" />

  const pagar = () => {
    onPagar()
    navigate('/mis-entradas')
  }

  return (
    <main className="pagina compra">
      <PasosCompra paso={3} />
      <BannerReserva
        vencimiento={carrito.vencimiento}
        mensaje="Tenés tiempo para completar el pago. Si se termina, liberamos las entradas."
      />
      <div className="compra__grilla">
        <section>
          <h1 className="titulo-pagina aparece">Pago</h1>
          <ListaCompra lineas={lineas} />
          <DatosPago usuario={usuario} />
        </section>
        <TotalPago lineas={lineas} items={carrito.items} onPagar={pagar} />
      </div>
    </main>
  )
}
