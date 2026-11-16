import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ContenidoEvento from '../components/ContenidoEvento.jsx'
import EstadoDetalle from '../components/EstadoDetalle.jsx'
import { agregarItem } from '../redux/carritoSlice'
import { obtenerEvento, obtenerImagenes, obtenerOfertas } from '../redux/eventosSlice'
import { obtenerFotosLocacion, obtenerLocaciones } from '../redux/locacionesSlice'
import { rutaDeVuelta } from '../utils/enlaces.js'
import { detalleDisponible } from '../utils/eventos.js'
import { galeriaDelDetalle } from '../utils/fotos.js'
import { borrarSeleccionPendiente, guardarSeleccionPendiente, leerSeleccionPendiente } from '../utils/seleccionPendiente.js'
import '../styles/detalle-catalogo.css'

// Pantalla "/eventos/:id". La "key" hace que al cambiar de evento la pantalla empiece de cero.
export default function EventoDetalle() {
  const { id } = useParams()
  return <DetalleEvento key={id} id={id} />
}

// El evento se busca en el store por su id: si vino del catálogo ya trae sus entradas y fotos, y no se pide de nuevo.
// Cada dato que falta se pide con su propia acción.
function DetalleEvento({ id }) {
  const { sesion } = useSelector((state) => state.usuario)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, pedidos, errorEvento } = useSelector((state) => state.eventos)
  const { items: locaciones, cargado: locacionesCargadas } = useSelector((state) => state.locaciones)
  const { carrito, cargado: carritoCargado, agregando, errorAgregar } = useSelector((state) => state.carrito)
  const [ahora, setAhora] = useState(Date.now)
  const [aviso, setAviso] = useState('')
  const [origenPendiente] = useState(() => leerSeleccionPendiente()?.volverA)
  const volverA = rutaDeVuelta(location.state?.volverA || origenPendiente)
  const idValido = /^\d+$/.test(id) && Number(id) >= 1
  const eventoId = Number(id)
  const token = sesion?.rol === 'ADMIN' ? sesion.token : undefined // el administrador ve también los borradores (vista previa)
  const evento = items.find((item) => item.id === eventoId)
  const lugar = locaciones.find((locacion) => locacion.id === evento?.locacionId)
  const fallo = errorEvento?.id === eventoId
  const hayEvento = Boolean(evento)
  const yaPedido = pedidos.includes(eventoId)
  const conOfertas = Boolean(evento?.ofertas)
  const conImagenes = Boolean(evento?.imagenes)
  const lugarId = lugar?.id
  const conFotosDelLugar = Boolean(lugar?.imagenes)

  useEffect(() => {
    if (idValido && !hayEvento && !yaPedido) dispatch(obtenerEvento({ id: eventoId, token }))
  }, [dispatch, idValido, hayEvento, yaPedido, eventoId, token])

  useEffect(() => {
    if (hayEvento && !conOfertas) dispatch(obtenerOfertas({ eventoId, token }))
  }, [dispatch, hayEvento, conOfertas, eventoId, token])

  useEffect(() => {
    if (hayEvento && !conImagenes) dispatch(obtenerImagenes({ eventoId, token }))
  }, [dispatch, hayEvento, conImagenes, eventoId, token])

  // La galería suma al final las fotos del lugar: se piden los lugares y las fotos de este solo si todavía no están
  useEffect(() => {
    if (hayEvento && !locacionesCargadas) dispatch(obtenerLocaciones())
  }, [dispatch, hayEvento, locacionesCargadas])

  useEffect(() => {
    if (lugarId && !conFotosDelLugar) dispatch(obtenerFotosLocacion(lugarId))
  }, [dispatch, lugarId, conFotosDelLugar])

  // Si eligió una entrada antes de ingresar, al volver del login se agrega sola: es un despacho al montar, como el del botón.
  // Se espera a que el carrito haya cargado, así la respuesta de ese GET no pisa la del agregado.
  useEffect(() => {
    const pendiente = leerSeleccionPendiente()
    if (!pendiente || pendiente.eventoId !== eventoId || sesion?.rol !== 'USER' || !carritoCargado) return
    borrarSeleccionPendiente()
    dispatch(agregarItem({ token: sesion.token, eventoTipoEntradaId: pendiente.ofertaId, cantidad: pendiente.cantidad }))
  }, [dispatch, eventoId, sesion, carritoCargado])

  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(reloj)
  }, [])

  const cargando = !fallo && !conOfertas
  if (!detalleDisponible({ idValido, cargando, error: fallo, evento, esAdmin: sesion?.rol === 'ADMIN' })) {
    return (
      <EstadoDetalle
        idValido={idValido}
        cargando={cargando}
        error={fallo ? { message: 'Revisá el enlace o probá de nuevo en un momento.' } : null}
        evento={evento}
        volverA={volverA}
        onReintentar={() => dispatch(obtenerEvento({ id: eventoId, token }))}
      />
    )
  }

  // Cuántas de cada entrada ya están en el carrito: cada fila lo muestra
  const enCarrito = Object.fromEntries(carrito.items.map((item) => [item.eventoTipoEntradaId, item.cantidad]))

  // Cada tipo de entrada se agrega con su propio botón: una acción, un pedido. Sin sesión se guarda la elección y se va a ingresar
  const agregar = (oferta, cantidad) => {
    if (!sesion) {
      guardarSeleccionPendiente(eventoId, oferta.id, cantidad, volverA)
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

  // Si las entradas no se pudieron cargar, se vuelven a pedir con el botón "Reintentar"
  const reintentar = () => dispatch(obtenerOfertas({ eventoId, token }))

  return (
    <ContenidoEvento
      evento={{ ...evento, imagenes: galeriaDelDetalle(evento, lugar) }}
      ahora={ahora}
      volverA={volverA}
      aviso={aviso}
      enCarrito={enCarrito}
      agregando={agregando}
      errorAgregar={errorAgregar}
      onAgregar={agregar}
      onReintentar={reintentar}
    />
  )
}
