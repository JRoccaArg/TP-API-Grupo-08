import { useState } from 'react'
import Aviso from '../components/Aviso.jsx'
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

  if (usuario?.rol !== 'USER') {
    return <Aviso mensaje="Ingresá para ver tu carrito." boton="Ingresar" to="/login" />
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

  // Cada acción espera la respuesta del back: mientras tanto se bloquean los botones y, si falla, se muestra su mensaje.
  const hacer = (accion) => {
    setOcupado(true)
    setAviso('')
    accion()
      .catch((fallo) => setAviso(fallo.message))
      .then(() => setOcupado(false))
  }

  return (
    <main className="pagina compra">
      <PasosCompra paso={2} />
      <BannerReserva
        vencimiento={vencimientoMs(carrito)}
        mensaje="Tus entradas están reservadas. Si se termina el tiempo, las liberamos."
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
            <Boton variante="peligro" clase="boton--chico" deshabilitado={ocupado} onClick={() => hacer(onVaciar)}>
              Vaciar carrito
            </Boton>
          </div>
        </section>
        <ResumenCompra carrito={carrito} onIrAPagar={onIrAPagar} />
      </div>
    </main>
  )
}
