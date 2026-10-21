import { useState } from 'react'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import BannerReserva from '../components/BannerReserva.jsx'
import LineaCarrito from '../components/LineaCarrito.jsx'
import PasosCompra from '../components/PasosCompra.jsx'
import ResumenCompra from '../components/ResumenCompra.jsx'
import { vencimientoMs } from '../utils/carrito.js'

// Pantalla "/carrito": paso 2 de la compra. Muestra el carrito que devuelve el back y lo modifica con sus respuestas.
export default function Carrito({ usuario, carrito, carga, vencido, eventos, onCambiar, onVaciar, onIrAPagar, onReintentar }) {
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false)

  if (usuario?.rol !== 'USER') {
    return <AvisoAcceso usuario={usuario} para="USER" sinSesion="Ingresá para ver tu carrito." />
  }
  if (vencido) return <Aviso mensaje="Se terminó el tiempo y liberamos tus entradas." boton="Ver fechas" to="/" />
  if (carga.cargando && carrito.items.length === 0) {
    return <main className="pagina compra"><p className="admin__cargando" role="status">Cargando tu carrito…</p></main>
  }
  if (carga.error) {
    return (
      <main className="pagina aviso">
        <h1 className="aviso__mensaje">No pudimos cargar tu carrito.</h1>
        <p role="alert">{carga.error}</p>
        <Boton onClick={onReintentar}>Reintentar</Boton>
      </main>
    )
  }
  if (carrito.items.length === 0) return <Aviso mensaje="Tu carrito está vacío." boton="Ver fechas" to="/" />

  const hacer = (accion) => {
    setOcupado(true)
    setAviso('')
    accion()
      .catch((fallo) => setAviso(fallo.message))
      .then(() => setOcupado(false))
  }
  // Vaciar saca todas las entradas y no se deshace: el primer clic pide confirmación y el segundo vacía.
  const vaciar = () => {
    if (!confirmandoVaciar) {
      setConfirmandoVaciar(true)
      return
    }
    setConfirmandoVaciar(false)
    hacer(onVaciar)
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
                ocupado={ocupado}
                onCambiar={(cantidad) => hacer(() => onCambiar(item.id, cantidad))}
              />
            ))}
          </ul>
          {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
          <div className="compra__acciones">
            <Boton to="/" variante="contorno" clase="boton--chico">
              Seguir comprando
            </Boton>
            <Boton variante="peligro" clase="boton--chico" deshabilitado={ocupado} onClick={vaciar}>
              {confirmandoVaciar ? 'Confirmar: vaciar carrito' : 'Vaciar carrito'}
            </Boton>
          </div>
        </section>
        <ResumenCompra carrito={carrito} onIrAPagar={onIrAPagar} />
      </div>
    </main>
  )
}
