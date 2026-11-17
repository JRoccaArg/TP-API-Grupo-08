import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import FilaEntrada from './FilaEntrada.jsx'
import { agregarItem } from '../redux/carritoSlice'
import { borrarSeleccionPendiente, guardarSeleccionPendiente, leerSeleccionPendiente } from '../utils/seleccionPendiente.js'

// Las entradas del evento, cada una con su botón "Agregar". Lee el carrito del store (cuántas hay de cada una, cuál se está
// agregando y el error de cada fila) y despacha el agregado. "volverA" es a dónde vuelve el catálogo si primero tiene que ingresar.
export default function ListaEntradas({ evento, volverA }) {
  const { sesion } = useSelector((state) => state.usuario)
  const { carrito, cargado: carritoCargado, agregando, errorAgregar } = useSelector((state) => state.carrito)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [ahora, setAhora] = useState(Date.now)
  const [aviso, setAviso] = useState('')
  const enCarrito = Object.fromEntries(carrito.items.map((item) => [item.eventoTipoEntradaId, item.cantidad]))

  // El estado de cada entrada depende de la hora (por ejemplo, cuándo cierra la venta)
  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(reloj)
  }, [])

  // Si eligió una entrada antes de ingresar, al volver del login se agrega sola: es un despacho al montar, como el del botón.
  // Se espera a que el carrito haya cargado, así la respuesta de ese GET no pisa la del agregado.
  useEffect(() => {
    const pendiente = leerSeleccionPendiente()
    if (!pendiente || pendiente.eventoId !== evento.id || sesion?.rol !== 'USER' || !carritoCargado) return
    borrarSeleccionPendiente()
    dispatch(agregarItem({ token: sesion.token, eventoTipoEntradaId: pendiente.ofertaId, cantidad: pendiente.cantidad }))
  }, [dispatch, evento.id, sesion, carritoCargado])

  // Cada tipo de entrada se agrega con su propio botón: una acción, un pedido. Sin sesión se guarda la elección y se va a ingresar
  const agregar = (oferta, cantidad) => {
    if (!sesion) {
      guardarSeleccionPendiente(evento.id, oferta.id, cantidad, volverA)
      navigate('/login')
      return
    }
    if (sesion.rol !== 'USER') {
      setAviso('Solo los usuarios pueden comprar entradas: el administrador no tiene carrito.')
      return
    }
    setAviso('')
    dispatch(agregarItem({ token: sesion.token, eventoTipoEntradaId: oferta.id, cantidad }))
  }

  return (
    <section className="entradas">
      <div className="entradas__cabecera">
        <h2>Elegí tus entradas</h2>
      </div>
      <ul className="entradas__lista">
        {evento.ofertas.map((oferta) => (
          <FilaEntrada
            key={oferta.id}
            oferta={oferta}
            evento={evento}
            ahora={ahora}
            enCarrito={enCarrito[oferta.id] || 0}
            agregando={agregando === oferta.id}
            ocupado={agregando !== null}
            error={errorAgregar?.ofertaId === oferta.id ? errorAgregar.mensaje : ''}
            onAgregar={(cantidad) => agregar(oferta, cantidad)}
          />
        ))}
      </ul>
      {evento.ofertas.length > 0 ? (
        <p className="barra-compra__nota">
          Las entradas se reservan al agregarlas al carrito. Tenés 15 minutos desde la primera entrada que sumás, y ese tiempo es el mismo para todo el carrito.
        </p>
      ) : (
        <p className="catalogo-nota">Todavía no hay tipos de entrada publicados para este evento.</p>
      )}
      {aviso && <p className="catalogo-nota" role="status">{aviso}</p>}
    </section>
  )
}
