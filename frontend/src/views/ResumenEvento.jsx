import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import DatoResumen from '../components/DatoResumen.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import VentasPorEntrada from '../components/VentasPorEntrada.jsx'
import { obtenerEstadisticas, obtenerEventosAdmin } from '../redux/eventosSlice'
import { datosDelResumen } from '../utils/estadisticas.js'
import { diaYFecha, horario } from '../utils/fechas.js'

// Pantalla "/admin/:id": resumen del evento (ventas, recaudado, compras e ingresos) y sus acciones. Solo ADMIN.
export default function ResumenEvento({ usuario }) {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { items, todos, errorAdmin, estadisticas, errorEstadisticas } = useSelector((state) => state.eventos)
  const token = usuario?.rol === 'ADMIN' ? usuario.token : null
  const evento = items.find((item) => item.id === Number(id))
  const eventoId = evento?.id
  // Si las ventas guardadas son de otro evento, se piden las de este (la idea de meta.arg que dio la profe)
  const ventas = estadisticas?.eventoId === Number(id) ? estadisticas : null

  useEffect(() => {
    if (token && !eventoId && todos === null) dispatch(obtenerEventosAdmin(token))
  }, [dispatch, token, eventoId, todos])

  useEffect(() => {
    if (token && !ventas) dispatch(obtenerEstadisticas({ eventoId: Number(id), token }))
  }, [dispatch, token, id, ventas])

  if (!token) return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  if (!evento && todos === null && errorAdmin) return <Aviso mensaje={errorAdmin} boton="Volver" to="/admin" />
  if (!evento && todos !== null) return <Aviso mensaje="No encontramos este evento." boton="Volver" to="/admin" />
  if (!evento) {
    return <main className="pagina admin"><p className="admin__cargando" role="status">Cargando evento…</p></main>
  }

  // Las ventas cambian con cada compra: se vuelven a pedir solo con este botón, como "Actualizar disponibilidad" del carrito
  const actualizarVentas = () => dispatch(obtenerEstadisticas({ eventoId: evento.id, token }))

  return (
    <main className="pagina admin">
      <div className="admin__encabezado">
        <TituloAdmin
          migas={[{ texto: 'Gestionar eventos', ruta: '/admin' }, { texto: evento.titulo }]}
          titulo={evento.titulo}
          bajada={`${diaYFecha(evento.fechaHoraInicio)} · ${horario(evento.fechaHoraInicio, evento.fechaHoraFin)} · ${evento.locacionNombre} · ${evento.estado}`}
        />
        <div className="resumen__acciones">
          <Boton to={`/admin/${evento.id}/editar`} clase="boton--grande">Editar evento</Boton>
          <Boton to={`/admin/${evento.id}/escanear`} variante="contorno" clase="boton--grande">Escanear QR</Boton>
          <Boton variante="contorno" clase="boton--grande" onClick={actualizarVentas}>Actualizar ventas</Boton>
        </div>
      </div>
      {evento.errorEdicion && <p className="admin__aviso admin__aviso--error" role="alert">{evento.errorEdicion}</p>}
      {ventas ? (
        <>
          <ul className="resumen__datos">
            {datosDelResumen(ventas).map((dato) => <DatoResumen key={dato.etiqueta} {...dato} />)}
          </ul>
          <p className="admin__seccion resumen__subtitulo">VENTAS POR ENTRADA</p>
          <VentasPorEntrada porEntrada={ventas.porEntrada} />
        </>
      ) : errorEstadisticas ? (
        <p className="admin__aviso admin__aviso--error" role="alert">No pudimos cargar las ventas del evento. Probá con «Actualizar ventas».</p>
      ) : (
        <p className="admin__cargando" role="status">Cargando ventas…</p>
      )}
    </main>
  )
}
