import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import AvisoEventoAfectado from '../components/AvisoEventoAfectado.jsx'
import CabeceraMisEntradas from '../components/CabeceraMisEntradas.jsx'
import EventoComprado from '../components/EventoComprado.jsx'
import TarjetaEntrada from '../components/TarjetaEntrada.jsx'
import { obtenerMisCompras } from '../redux/comprasSlice'
import { obtenerEvento, obtenerImagenes } from '../redux/eventosSlice'
import { agruparPorEvento, entradasDeCompras, eventoAfectado, idsDeEventosDeCompras } from '../utils/compras.js'
import { eventosConFotos } from '../utils/fotos.js'

// Pantallas "/mis-entradas" y "/mis-entradas/:eventoId": las entradas del usuario agrupadas por evento.
// Con más de un evento primero se elige el evento (sus QR van en /mis-entradas/:eventoId); con uno solo se ven directo.
export default function MisEntradas({ usuario }) {
  const { eventoId } = useParams()
  const dispatch = useDispatch()
  const { items: compras, error, cargado } = useSelector((state) => state.compras)
  const { items, pedidos } = useSelector((state) => state.eventos)
  const token = usuario?.rol === 'USER' ? usuario.token : null
  const ids = idsDeEventosDeCompras(compras)
  // De cada evento comprado se pide solo lo que todavía no está en el store
  const faltan = ids.filter((id) => !items.some((evento) => evento.id === id) && !pedidos.includes(id))
  const sinFotos = items.filter((evento) => ids.includes(evento.id) && !evento.imagenes).map((evento) => evento.id)

  // La lista se pide una sola vez: lo que se compre después se suma con la respuesta del pago
  useEffect(() => {
    if (token && !cargado) dispatch(obtenerMisCompras(token))
  }, [dispatch, token, cargado])

  useEffect(() => {
    faltan.forEach((id) => dispatch(obtenerEvento({ id })))
  }, [dispatch, faltan])

  useEffect(() => {
    sinFotos.forEach((id) => dispatch(obtenerImagenes({ eventoId: id })))
  }, [dispatch, sinFotos])

  if (!token) return <AvisoAcceso usuario={usuario} para="USER" sinSesion="Ingresá para ver tus entradas." />
  if (!cargado && error) {
    return (
      <main className="pagina aviso">
        <h1 className="aviso__mensaje">No pudimos cargar tus entradas.</h1>
        <p role="alert">{error}</p>
        <Boton onClick={() => dispatch(obtenerMisCompras(token))}>Reintentar</Boton>
      </main>
    )
  }
  if (!cargado) {
    return <main className="pagina compra"><p className="admin__cargando" role="status">Cargando tus entradas…</p></main>
  }
  const grupos = agruparPorEvento(entradasDeCompras(compras), eventosConFotos(items, ids))
  if (grupos.length === 0) return <Aviso mensaje="Todavía no compraste entradas." boton="Ver fechas" to="/#fechas" />
  const elegido = eventoId ? grupos.find((grupo) => String(grupo.id) === eventoId) : grupos.length === 1 ? grupos[0] : null
  if (eventoId && !elegido) return <Aviso mensaje="No tenés entradas para este evento." boton="Ver mis entradas" to="/mis-entradas" />

  return (
    <div className="fondo-dorado">
      <main className="pagina mis-entradas">
        <CabeceraMisEntradas grupo={elegido} varios={grupos.length > 1} />
        {elegido && eventoAfectado(elegido.evento) && <AvisoEventoAfectado evento={elegido.evento} compras={compras} token={token} />}
        {elegido ? (
          <div className="mis-entradas__grilla">
            {elegido.entradas.map((entrada, indice) => (
              <TarjetaEntrada key={entrada.id} entrada={entrada} evento={elegido.evento} comprador={usuario.nombre}
                numero={indice + 1} total={elegido.entradas.length} />
            ))}
          </div>
        ) : (
          <div className="mis-entradas__eventos">
            {grupos.map((grupo) => <EventoComprado key={grupo.id} grupo={grupo} />)}
          </div>
        )}
      </main>
    </div>
  )
}
