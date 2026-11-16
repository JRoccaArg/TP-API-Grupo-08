import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import BannerReserva from '../components/BannerReserva.jsx'
import LineaCarrito from '../components/LineaCarrito.jsx'
import PasosCompra from '../components/PasosCompra.jsx'
import ResumenCompra from '../components/ResumenCompra.jsx'
import { cambiarCantidad, obtenerCarrito, quitarItem, vaciarCarrito } from '../redux/carritoSlice'
import { idsDeEventos, vencimientoMs } from '../utils/carrito.js'
import { eventosConFotos } from '../utils/fotos.js'

// Pantalla "/carrito": paso 2 de la compra. Muestra el carrito del store; cada cambio es una acción y su respuesta lo actualiza.
export default function Carrito() {
  const { sesion } = useSelector((state) => state.usuario)
  const dispatch = useDispatch()
  const { carrito, error, cargado, vencido, guardando, errorAccion } = useSelector((state) => state.carrito)
  const { items } = useSelector((state) => state.eventos)
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false)

  if (sesion?.rol !== 'USER') {
    return <AvisoAcceso usuario={sesion} para="USER" sinSesion="Ingresá para ver tu carrito." />
  }
  if (vencido) return <Aviso mensaje="Se terminó el tiempo y liberamos tus entradas." boton="Ver fechas" to="/" />
  if (!cargado && error) {
    return (
      <main className="pagina aviso">
        <h1 className="aviso__mensaje">No pudimos cargar tu carrito.</h1>
        <p role="alert">{error}</p>
        <Boton onClick={() => dispatch(obtenerCarrito(sesion.token))}>Reintentar</Boton>
      </main>
    )
  }
  if (!cargado) {
    return <main className="pagina compra"><p className="admin__cargando" role="status">Cargando tu carrito…</p></main>
  }
  if (carrito.items.length === 0) return <Aviso mensaje="Tu carrito está vacío." boton="Ver fechas" to="/" />

  const eventos = eventosConFotos(items, idsDeEventos(carrito))
  // Con 0 la línea se quita; si no, se cambia la cantidad. Cada cosa es su propio pedido
  const cambiar = (item, cantidad) => {
    if (cantidad > 0) dispatch(cambiarCantidad({ token: sesion.token, itemId: item.id, cantidad }))
    else dispatch(quitarItem({ token: sesion.token, itemId: item.id }))
  }
  // Vaciar saca todas las entradas y no se deshace: el primer clic pide confirmación y el segundo vacía.
  const vaciar = () => {
    if (!confirmandoVaciar) {
      setConfirmandoVaciar(true)
      return
    }
    setConfirmandoVaciar(false)
    dispatch(vaciarCarrito(sesion.token))
  }

  return (
    <main className="pagina compra">
      <PasosCompra paso={2} />
      <BannerReserva
        vencimiento={vencimientoMs(carrito)}
        mensaje="Tus entradas están reservadas. El tiempo es uno solo para todo el carrito: lo que sumes después vence junto con lo demás, aunque queden menos de 15 minutos. Si se termina, las liberamos."
      />
      <div className="compra__grilla">
        <section>
          <h1 className="titulo-pagina aparece">Tu carrito</h1>
          <ul className="lineas">
            {carrito.items.map((item) => (
              <LineaCarrito
                key={item.id}
                item={item}
                evento={eventos[item.eventoId]}
                ocupado={guardando}
                onCambiar={(cantidad) => cambiar(item, cantidad)}
              />
            ))}
          </ul>
          {errorAccion && <p className="admin__aviso admin__aviso--error" role="alert">{errorAccion}</p>}
          <div className="compra__acciones">
            <Boton to="/" variante="contorno" clase="boton--chico">
              Seguir comprando
            </Boton>
            <Boton variante="peligro" clase="boton--chico" deshabilitado={guardando} onClick={vaciar}>
              {confirmandoVaciar ? 'Confirmar: vaciar carrito' : 'Vaciar carrito'}
            </Boton>
          </div>
        </section>
        <ResumenCompra carrito={carrito} />
      </div>
    </main>
  )
}
