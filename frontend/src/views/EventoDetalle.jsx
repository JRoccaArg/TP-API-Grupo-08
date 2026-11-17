import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import ContenidoEvento from '../components/ContenidoEvento.jsx'
import EstadoDetalle from '../components/EstadoDetalle.jsx'
import { obtenerEvento, obtenerImagenes, obtenerOfertas } from '../redux/eventosSlice'
import { obtenerFotosLocacion, obtenerLocaciones } from '../redux/locacionesSlice'
import { rutaDeVuelta } from '../utils/enlaces.js'
import { detalleDisponible } from '../utils/eventos.js'
import { galeriaDelDetalle } from '../utils/fotos.js'
import { leerSeleccionPendiente } from '../utils/seleccionPendiente.js'
import '../styles/detalle-catalogo.css'

// Pantalla "/eventos/:id". La "key" hace que al cambiar de evento la pantalla empiece de cero.
export default function EventoDetalle() {
  const { id } = useParams()
  return <DetalleEvento key={id} id={id} />
}

// El evento se busca en el store por su id: si vino del catálogo ya trae sus entradas y fotos, y no se pide de nuevo.
// Cada dato que falta se pide con su propia acción. Agregar al carrito lo maneja ListaEntradas.
function DetalleEvento({ id }) {
  const { sesion } = useSelector((state) => state.usuario)
  const location = useLocation()
  const dispatch = useDispatch()
  const { items, pedidos, errorEvento } = useSelector((state) => state.eventos)
  const { items: locaciones, cargado: locacionesCargadas } = useSelector((state) => state.locaciones)
  // Si viene del login con una entrada elegida, "Volver al catálogo" lleva a la página de donde salió
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

  const cargando = !fallo && !conOfertas
  if (!detalleDisponible({ idValido, cargando, error: fallo, evento, esAdmin: sesion?.rol === 'ADMIN' })) {
    return (
      <EstadoDetalle
        idValido={idValido}
        cargando={cargando}
        error={fallo ? { message: 'Revisá el enlace o probá de nuevo en un momento.', noExiste: errorEvento.noExiste } : null}
        evento={evento}
        volverA={volverA}
        onReintentar={() => dispatch(obtenerEvento({ id: eventoId, token }))}
      />
    )
  }

  // Si las entradas no se pudieron cargar, se vuelven a pedir con el botón "Reintentar"
  const reintentar = () => dispatch(obtenerOfertas({ eventoId, token }))

  return <ContenidoEvento evento={{ ...evento, imagenes: galeriaDelDetalle(evento, lugar) }} volverA={volverA} onReintentar={reintentar} />
}
