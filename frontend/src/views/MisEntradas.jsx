import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import AvisoEventoAfectado from '../components/AvisoEventoAfectado.jsx'
import CabeceraMisEntradas from '../components/CabeceraMisEntradas.jsx'
import EventoComprado from '../components/EventoComprado.jsx'
import TarjetaEntrada from '../components/TarjetaEntrada.jsx'
import { obtenerMisCompras } from '../utils/apiCompras.js'
import { obtenerEventosPorId } from '../utils/apiEventos.js'
import { agruparPorEvento, entradasDeCompras, eventoAfectado, idsDeEventosDeCompras, reemplazarCompra } from '../utils/compras.js'

// Pantallas "/mis-entradas" y "/mis-entradas/:eventoId": las entradas del usuario agrupadas por evento.
// Con más de un evento primero se elige el evento (sus QR van en /mis-entradas/:eventoId); con uno solo se ven directo.
export default function MisEntradas({ usuario }) {
  const { eventoId } = useParams()
  const token = usuario?.rol === 'USER' ? usuario.token : null
  const [compras, setCompras] = useState(null) // null mientras se piden
  const [eventos, setEventos] = useState(null) // { id: evento } de cada entrada
  const [error, setError] = useState('')
  const [reintento, setReintento] = useState(0)

  useEffect(() => {
    if (!token) return undefined
    let activo = true
    obtenerMisCompras(token)
      .then((lista) => { if (activo) setCompras(lista) })
      .catch((fallo) => { if (activo) setError(fallo.message) })
    return () => { activo = false }
  }, [token, reintento])

  useEffect(() => {
    if (!compras) return undefined
    let activo = true
    obtenerEventosPorId(idsDeEventosDeCompras(compras)).then((pedidos) => { if (activo) setEventos(pedidos) })
    return () => { activo = false }
  }, [compras])

  if (!token) return <AvisoAcceso usuario={usuario} para="USER" sinSesion="Ingresá para ver tus entradas." />
  if (error) {
    return (
      <main className="pagina aviso">
        <h1 className="aviso__mensaje">No pudimos cargar tus entradas.</h1>
        <p role="alert">{error}</p>
        <Boton onClick={() => { setError(''); setReintento(reintento + 1) }}>Reintentar</Boton>
      </main>
    )
  }
  if (!compras || !eventos) {
    return <main className="pagina compra"><p className="admin__cargando" role="status">Cargando tus entradas…</p></main>
  }
  const grupos = agruparPorEvento(entradasDeCompras(compras), eventos)
  if (grupos.length === 0) return <Aviso mensaje="Todavía no compraste entradas." boton="Ver fechas" to="/#fechas" />
  const elegido = eventoId ? grupos.find((grupo) => String(grupo.id) === eventoId) : grupos.length === 1 ? grupos[0] : null
  if (eventoId && !elegido) return <Aviso mensaje="No tenés entradas para este evento." boton="Ver mis entradas" to="/mis-entradas" />

  return (
    <div className="fondo-dorado">
      <main className="pagina mis-entradas">
        <CabeceraMisEntradas grupo={elegido} varios={grupos.length > 1} />
        {elegido && eventoAfectado(elegido.evento) && (
          <AvisoEventoAfectado
            evento={elegido.evento}
            compras={compras}
            token={token}
            onReembolsada={(nueva) => setCompras((actuales) => reemplazarCompra(actuales, nueva))}
          />
        )}
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
