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
import { vencimientoMs } from '../utils/carrito.js'
import { erroresTarjeta, limpiarCampo, tarjetaPrueba, tarjetaValida, tarjetaVacia } from '../utils/tarjeta.js'

// Pantalla "/pago": paso 3. Se llega con "Ir a pagar", que ya pasó el carrito a EN_PAGO en el back (con su reloj de pago).
// El cobro es de demostración: solo se revisa el formato de la tarjeta (nunca se envía) y "Pagar" le pide al back
// que compre el carrito. Con la compra confirmada se pasa a su pantalla.
export default function Pago({ usuario, carrito, carga, vencido, onPagar }) {
  const navigate = useNavigate()
  const [tarjeta, setTarjeta] = useState(tarjetaVacia)
  const [intento, setIntento] = useState(false)
  const [pagando, setPagando] = useState(false)
  const [aviso, setAviso] = useState('')
  const errores = erroresTarjeta(tarjeta)

  if (usuario?.rol !== 'USER') {
    return <Aviso mensaje="Ingresá para pagar tus entradas." boton="Ingresar" to="/login" />
  }
  if (vencido) return <TiempoAgotado />
  if (carga.cargando && carrito.items.length === 0) {
    return <main className="pagina compra"><p className="admin__cargando" role="status">Cargando tu pago…</p></main>
  }
  if (carrito.items.length === 0) return <Aviso mensaje="No hay nada para pagar." boton="Ver fechas" to="/" />
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
    setAviso('')
    onPagar()
      .then((compra) => navigate(`/compra/${compra.id}`, { state: { compra } }))
      .catch((fallo) => {
        setAviso(fallo.message)
        setPagando(false)
      })
  }

  return (
    <main className="pagina compra">
      <PasosCompra paso={3} />
      <BannerPago vencimiento={vencimientoMs(carrito)} />
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
          {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
          <Boton to="/carrito" variante="contorno" clase="boton--chico pago__volver">
            <Icono nombre="flechaIzq" tamano={16} /> Volver al carrito
          </Boton>
        </section>
        <TotalPago carrito={carrito} pagando={pagando} onPagar={pagar} />
      </div>
    </main>
  )
}
