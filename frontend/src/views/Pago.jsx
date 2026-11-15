import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import Icono from '../components/Icono.jsx'
import BannerPago from '../components/BannerPago.jsx'
import DatosPago from '../components/DatosPago.jsx'
import PagoTarjeta from '../components/PagoTarjeta.jsx'
import PasosCompra from '../components/PasosCompra.jsx'
import TiempoAgotado from '../components/TiempoAgotado.jsx'
import TotalPago from '../components/TotalPago.jsx'
import { iniciarPago } from '../redux/carritoSlice'
import { pagarCarrito } from '../redux/comprasSlice'
import { vencimientoMs } from '../utils/carrito.js'
import { erroresTarjeta, limpiarCampo, tarjetaPrueba, tarjetaValida, tarjetaVacia } from '../utils/tarjeta.js'

// Pantalla "/pago" (paso 3). Al entrar se le pide al back que abra el pago (iniciar-pago): el carrito pasa a EN_PAGO con su reloj.
// El cobro es de demostración: solo se revisa el formato de la tarjeta (nunca se envía) y "Pagar" le pide al back que compre el carrito.
export default function Pago() {
  const { sesion } = useSelector((state) => state.usuario)
  const dispatch = useDispatch()
  const { carrito, cargado, vencido, guardando, errorAccion } = useSelector((state) => state.carrito)
  const { ultimaCompra, pagando, errorPago } = useSelector((state) => state.compras)
  const [tarjeta, setTarjeta] = useState(tarjetaVacia)
  const [intento, setIntento] = useState(false)
  const errores = erroresTarjeta(tarjeta)
  const token = sesion?.rol === 'USER' ? sesion.token : null
  const hayEntradas = carrito.items.length > 0

  useEffect(() => {
    if (token && cargado && hayEntradas && carrito.estado === 'ACTIVO') dispatch(iniciarPago(token))
  }, [dispatch, token, cargado, hayEntradas, carrito.estado])

  if (!token) return <AvisoAcceso usuario={sesion} para="USER" sinSesion="Ingresá para pagar tus entradas." />
  if (vencido) return <TiempoAgotado />
  if (!cargado) return <main className="pagina compra"><p className="admin__cargando" role="status">Cargando tu pago…</p></main>
  // Al pagar, el carrito queda vacío y llega la compra: la pantalla se redibuja y lleva a su confirmación
  if (!hayEntradas) {
    if (ultimaCompra) return <Navigate to={`/compra/${ultimaCompra.id}`} replace />
    return <Aviso mensaje="No hay nada para pagar." boton="Ver fechas" to="/" />
  }
  if (carrito.estado !== 'EN_PAGO') {
    if (errorAccion && !guardando) return <Aviso mensaje={errorAccion} boton="Ir al carrito" to="/carrito" />
    return <main className="pagina compra"><p className="admin__cargando" role="status">Abriendo el pago…</p></main>
  }

  const cambiar = (campo, texto) => setTarjeta({ ...tarjeta, [campo]: limpiarCampo(campo, texto, tarjeta.numero) })

  const pagar = () => {
    if (pagando) return
    if (!tarjetaValida(errores)) {
      setIntento(true)
      return
    }
    dispatch(pagarCarrito(token))
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
          <DatosPago usuario={sesion} />
          {errorPago && <p className="admin__aviso admin__aviso--error" role="alert">{errorPago}</p>}
          <Boton to="/carrito" variante="contorno" clase="boton--chico pago__volver">
            <Icono nombre="flechaIzq" tamano={16} /> Volver al carrito
          </Boton>
        </section>
        <TotalPago carrito={carrito} pagando={pagando} onPagar={pagar} />
      </div>
    </main>
  )
}
