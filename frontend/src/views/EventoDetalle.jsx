import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import BarraCompra from '../components/BarraCompra.jsx'
import DatosEvento from '../components/DatosEvento.jsx'
import FlyerEvento from '../components/FlyerEvento.jsx'
import Footer from '../components/Footer.jsx'
import ListaEntradas from '../components/ListaEntradas.jsx'
import { obtenerEvento, verificarSeleccion } from '../utils/apiEventos.js'
import { ajustarSeleccion } from '../utils/eventos.js'
import '../styles/detalle-catalogo.css'

// onAgregar pertenece al carrito visual de App: no se usa con IDs reales.
// El compañero podrá conectar onConfirmarSeleccion cuando el carrito use la API.
export default function EventoDetalle({ onConfirmarSeleccion }) {
  const { id } = useParams()
  return <DetalleEvento key={id} id={id} onConfirmarSeleccion={onConfirmarSeleccion} />
}

function DetalleEvento({ id, onConfirmarSeleccion }) {
  const location = useLocation()
  const [evento, setEvento] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [intento, setIntento] = useState(0)
  const [seleccion, setSeleccion] = useState([])
  const [ahora, setAhora] = useState(Date.now)
  const [enviando, setEnviando] = useState(false)
  const [confirmacion, setConfirmacion] = useState(null)
  const [aviso, setAviso] = useState('')
  const volverA = /^\/(?:\?|#|$)/.test(location.state?.volverA || '') ? location.state.volverA : '/#fechas'

  useEffect(() => {
    const control = new AbortController()
    if (!/^\d+$/.test(id) || Number(id) < 1) {
      return () => control.abort()
    }
    obtenerEvento(id, control.signal).then((datos) => {
      if (control.signal.aborted) return
      setEvento(datos)
      setAhora(Date.now())
      setSeleccion((actual) => ajustarSeleccion(actual, datos.ofertas, datos))
    }).catch((fallo) => {
      if (!control.signal.aborted) setError(fallo)
    }).finally(() => {
      if (!control.signal.aborted) setCargando(false)
    })
    return () => control.abort()
  }, [id, intento])

  useEffect(() => {
    window.scrollTo(0, 0)
    const reloj = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(reloj)
  }, [])


  useEffect(() => {
    if (!confirmacion || typeof onConfirmarSeleccion !== 'function') return
    const control = new AbortController()
    verificarSeleccion(confirmacion.evento, confirmacion.seleccion, control.signal)
      .then(({ evento: actualizado, seleccion: nueva, cambio }) => {
        if (control.signal.aborted) return
        setEvento(actualizado)
        setSeleccion(nueva)
        setAhora(Date.now())
        if (cambio) {
          setAviso('La disponibilidad o los precios cambiaron. Revisá la selección actualizada.')
          return
        }
        return Promise.resolve(onConfirmarSeleccion({
          eventoId: actualizado.id,
          items: nueva.map((item) => ({ eventoTipoEntradaId: item.ofertaId, cantidad: item.cantidad })),
        })).then(() => { if (!control.signal.aborted) setSeleccion([]) })
      }).catch((fallo) => {
        if (!control.signal.aborted) setAviso(fallo.message || 'No pudimos continuar. Intentá nuevamente.')
      }).finally(() => {
        if (!control.signal.aborted) { setEnviando(false); setConfirmacion(null) }
      })
    return () => control.abort()
  }, [confirmacion, onConfirmarSeleccion])

  const reintentar = () => { setCargando(true); setError(null); setIntento(intento + 1) }

  if (!/^\d+$/.test(id) || Number(id) < 1) return <Aviso mensaje="No encontramos este evento." boton="Volver al catálogo" to={volverA} />
  if (cargando) return <main className="pagina aviso detalle-catalogo" role="status"><h1>Cargando evento…</h1></main>
  if (error?.estado === 404 || evento?.estado?.toUpperCase() === 'BORRADOR') {
    return <Aviso mensaje="No encontramos este evento." boton="Volver al catálogo" to={volverA} />
  }
  if (error) return (
    <main className="pagina aviso detalle-catalogo">
      <h1>No pudimos cargar el evento.</h1><p role="alert">{error.message}</p>
      <Boton onClick={reintentar}>Reintentar</Boton>
      <Link className="enlace-oro" to={volverA}>Volver al catálogo</Link>
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
    setEnviando(true)
    setAviso('')
    setConfirmacion({ evento, seleccion: vigente })
  }

  const estados = {
    FINALIZADO: 'Esta edición ya finalizó.', CANCELADO: 'Este evento fue cancelado.',
    REPROGRAMADO: 'Este evento fue reprogramado. La venta no está habilitada.',
  }
  return (
    <div className="detalle-catalogo">
      <main className="pagina">
        <Link className="enlace-oro detalle-catalogo__volver" to={volverA}>← Volver al catálogo</Link>
        <div className="evento">
          <FlyerEvento evento={evento} />
          <div className="evento__contenido">
            <DatosEvento evento={evento} />
            {evento.estado?.toUpperCase() !== 'ACTIVO' && (
              <p className="evento__finalizado">{estados[evento.estado?.toUpperCase()] || 'La venta no está habilitada.'}</p>
            )}
            <button type="button" className="enlace-oro detalle-catalogo__actualizar" onClick={actualizar} disabled={enviando}>
              Actualizar disponibilidad e imágenes
            </button>
            {evento.errorOfertas ? (
              <p className="catalogo-nota" role="alert">No pudimos consultar las entradas. Reintentá actualizando la disponibilidad.</p>
            ) : (
              <>
                <ListaEntradas evento={evento} seleccion={vigente} onCambiar={cambiar} ahora={ahora} />
                {evento.estado?.toUpperCase() === 'ACTIVO' && evento.ofertas.length > 0 && (
                  <BarraCompra seleccion={vigente} ofertas={evento.ofertas} onConfirmar={confirmar}
                    conectado={typeof onConfirmarSeleccion === 'function'} enviando={enviando} />
                )}
              </>
            )}
            {aviso && <p className="catalogo-nota" role="status">{aviso}</p>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
