import { borrarSeleccionPendiente, guardarSeleccionPendiente, leerSeleccionPendiente } from '../utils/seleccionPendiente.js'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import ContenidoEvento from '../components/ContenidoEvento.jsx'
import { obtenerEvento, verificarSeleccion } from '../utils/apiEventos.js'
import { ajustarSeleccion, descontarStock } from '../utils/eventos.js'
import '../styles/detalle-catalogo.css'

// onConfirmarSeleccion agrega la selección al carrito del back (lo define Sitio) y devuelve una promesa.
export default function EventoDetalle({ usuario, onConfirmarSeleccion, cargaCarrito }) {
  const { id } = useParams()
  return <DetalleEvento key={id} id={id} cargaCarrito={cargaCarrito} usuario={usuario} onConfirmarSeleccion={onConfirmarSeleccion} />
}

function DetalleEvento({ id, usuario, onConfirmarSeleccion, cargaCarrito }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [intento, setIntento] = useState(0)
  const [pendiente] = useState(() => {
    const guardada = leerSeleccionPendiente()
    return String(guardada?.evento.id) === id ? guardada : null
  })
  const [seleccion, setSeleccion] = useState(() => pendiente?.seleccion || [])
  const [ahora, setAhora] = useState(Date.now)
  const [enviando, setEnviando] = useState(false)
  const [confirmacion, setConfirmacion] = useState(null)
  const [aviso, setAviso] = useState('')
  const origen = location.state?.volverA || pendiente?.volverA
  const volverA = /^\/(?:\?|#|$)/.test(origen || '') ? origen : '/#fechas'
  const idValido = /^\d+$/.test(id) && Number(id) >= 1

  useEffect(() => {
    if (!idValido) return undefined
    let activo = true
    obtenerEvento(id).then((datos) => {
      if (!activo) return
      setEvento(datos)
      setAhora(Date.now())
      setSeleccion((actual) => ajustarSeleccion(actual, datos.ofertas, datos))
      setCargando(false)
    }).catch((fallo) => {
      if (!activo) return
      setError(fallo)
      setCargando(false)
    })
    return () => { activo = false }
  }, [id, idValido, intento])

  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(reloj)
  }, [])

  // La carga inicial del carrito debe terminar antes de agregar entradas.
  useEffect(() => {
    if (!pendiente || !evento || usuario?.rol !== 'USER' || cargaCarrito?.cargando) return
    let activo = true
    queueMicrotask(() => {
      if (!activo || !leerSeleccionPendiente()) return
      borrarSeleccionPendiente()
      setEnviando(true)
      setConfirmacion({ evento: pendiente.evento, seleccion: pendiente.seleccion, retomada: true })
    })
    return () => { activo = false }
  }, [pendiente, evento, usuario, cargaCarrito?.cargando, cargaCarrito?.error])

  // Al confirmar se vuelven a consultar la disponibilidad y los precios; recién ahí se entrega la selección al carrito.
  useEffect(() => {
    if (!confirmacion || typeof onConfirmarSeleccion !== 'function') return undefined
    let activo = true
    const terminar = () => {
      if (activo) { setEnviando(false); setConfirmacion(null) }
    }
    verificarSeleccion(confirmacion.evento, confirmacion.seleccion)
      .then(({ evento: actualizado, seleccion: nueva, cambio }) => {
        if (!activo) return undefined
        setEvento(actualizado)
        setSeleccion(nueva)
        setAhora(Date.now())
        if (cambio) {
          setAviso('La disponibilidad o los precios cambiaron. Revisá la selección actualizada.')
          return undefined
        }
        return Promise.resolve(onConfirmarSeleccion({
          eventoId: actualizado.id,
          items: nueva.map((item) => ({ eventoTipoEntradaId: item.ofertaId, cantidad: item.cantidad })),
        })).then(() => {
          if (!activo) return
          // Las entradas quedaron apartadas: se descuentan del stock que se ve, sin volver a pedir el evento.
          setSeleccion([])
          setEvento(descontarStock(actualizado, nueva))
          setAviso('Agregamos las entradas a tu carrito. Las reservamos por 15 minutos.')
          if (confirmacion.retomada) navigate('/carrito', { replace: true })
        })
      })
      .then(terminar)
      .catch((fallo) => {
        if (activo) {
          setAviso(fallo.message || 'No pudimos continuar. Intentá nuevamente.')
          // Si alguna entrada ya entró al carrito, la selección se limpia para no agregarla dos veces.
          if (fallo.agregados > 0) { setSeleccion([]); setCargando(true); setIntento((actual) => actual + 1) }
        }
        terminar()
      })
    return () => { activo = false }
  }, [confirmacion, onConfirmarSeleccion, navigate])

  const reintentar = () => { setCargando(true); setError(null); setIntento(intento + 1) }

  if (!idValido) return <Aviso mensaje="No encontramos este evento." boton="Volver al catálogo" to={volverA} />
  if (cargando) return <main className="pagina aviso detalle-catalogo" role="status"><h1>Cargando evento…</h1></main>
  if (error?.estado === 404 || evento?.estado?.toUpperCase() === 'BORRADOR') {
    return <Aviso mensaje="No encontramos este evento." boton="Volver al catálogo" to={volverA} />
  }
  if (error) return (
    <main className="pagina aviso detalle-catalogo">
      <h1>No pudimos cargar el evento.</h1><p role="alert">{error.message}</p>
      <Boton onClick={reintentar}>Reintentar</Boton>
      <Boton to={volverA} variante="contorno">Volver al catálogo</Boton>
    </main>
  )

  const vigente = evento.errorOfertas ? [] : ajustarSeleccion(seleccion, evento.ofertas, evento, ahora)
  const cambiar = (ofertaId, cantidad) => {
    if (enviando) return
    const nueva = [...vigente.filter((item) => item.ofertaId !== ofertaId), { ofertaId, cantidad }]
    setSeleccion(ajustarSeleccion(nueva, evento.ofertas, evento))
    setAviso('')
  }
  const actualizar = () => {
    setAviso('Actualizamos la disponibilidad. Revisá tu selección antes de continuar.')
    reintentar()
  }
  const confirmar = () => {
    if (typeof onConfirmarSeleccion !== 'function' || !vigente.length || enviando) return
    if (!usuario) {
      guardarSeleccionPendiente(evento, vigente, volverA)
      navigate('/login')
      return
    }
    if (usuario.rol !== 'USER') {
      setAviso('Solo los usuarios pueden comprar entradas: el administrador no tiene carrito.')
      return
    }
    setEnviando(true)
    setAviso('')
    setConfirmacion({ evento, seleccion: vigente })
  }

  return (
    <ContenidoEvento
      evento={evento}
      seleccion={vigente}
      ahora={ahora}
      volverA={volverA}
      aviso={aviso}
      enviando={enviando}
      conectado={typeof onConfirmarSeleccion === 'function'}
      onCambiar={cambiar}
      onActualizar={actualizar}
      onConfirmar={confirmar}
    />
  )
}
