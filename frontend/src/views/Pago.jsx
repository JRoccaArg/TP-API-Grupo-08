import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import Icono from '../components/Icono.jsx'
import BannerPago from '../components/BannerPago.jsx'
import DatosPago from '../components/DatosPago.jsx'
import PagoTarjeta from '../components/PagoTarjeta.jsx'
import PasosCompra from '../components/PasosCompra.jsx'
import TiempoAgotado from '../components/TiempoAgotado.jsx'
import TotalPago from '../components/TotalPago.jsx'
import { detalleCarrito } from '../utils/carrito.js'
import { erroresTarjeta, limpiarCampo, tarjetaPrueba, tarjetaValida, tarjetaVacia } from '../utils/tarjeta.js'

// Pantalla "/pago": paso 3. Se llega con "Ir a pagar", que ya pasó el carrito a EN_PAGO (App controla el vencimiento).
// El cobro es simulado: se valida el formato de la tarjeta y "Pagar" emite las entradas.
export default function Pago({ usuario, carrito, vencido, onPagar }) {
  const navigate = useNavigate()
  const [tarjeta, setTarjeta] = useState(tarjetaVacia)
  const [intento, setIntento] = useState(false)
  const [pagando, setPagando] = useState(false)
  const lineas = detalleCarrito(carrito.items)
  const errores = erroresTarjeta(tarjeta)

  if (usuario?.rol !== 'USER') {
    return <Aviso mensaje="Ingresá para pagar tus entradas." boton="Ingresar" to="/login" />
  }
  if (vencido) return <TiempoAgotado />
  if (lineas.length === 0) return <Aviso mensaje="No hay nada para pagar." boton="Ver fechas" to="/" />
  if (carrito.estado !== 'EN_PAGO') {
    return <Aviso mensaje="Revisá tu carrito antes de pagar." boton="Ir al carrito" to="/carrito" />
  }

  const cambiar = (campo, texto) => setTarjeta({ ...tarjeta, [campo]: limpiarCampo(campo, texto, tarjeta.numero) })

  const pagar = () => {
    if (pagando) return
    if (!tarjetaValida(errores)) {
      setIntento(true)
      return
    }
    setPagando(true)
    // El setTimeout hace de "espera de la respuesta": con el backend acá va el fetch.
    setTimeout(() => {
      onPagar(lineas)
      navigate('/compra-confirmada')
    }, 1400)
  }

  return (
    <main className="pagina compra">
      <PasosCompra paso={3} />
      <BannerPago vencimiento={carrito.vencimiento} />
      <div className="compra__grilla">
        <section>
          <h1 className="titulo-pagina aparece">Pago</h1>
          <p className="rotulo pago__metodo">MÉTODO DE PAGO · TARJETA</p>
          <PagoTarjeta
            tarjeta={tarjeta}
            errores={errores}
            mostrarTodos={intento}
            onCambiar={cambiar}
            onProbar={() => setTarjeta(tarjetaPrueba)}
          />
          <DatosPago usuario={usuario} />
          <Boton to="/carrito" variante="contorno" clase="boton--chico pago__volver">
            <Icono nombre="flechaIzq" tamano={16} /> Volver al carrito
          </Boton>
        </section>
        <TotalPago lineas={lineas} items={carrito.items} pagando={pagando} onPagar={pagar} />
      </div>
    </main>
  )
}
