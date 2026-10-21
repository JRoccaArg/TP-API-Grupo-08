import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import AvisoGuardado from '../components/AvisoGuardado.jsx'
import Boton from '../components/Boton.jsx'
import DatoResumen from '../components/DatoResumen.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import VentasPorEntrada from '../components/VentasPorEntrada.jsx'
import { obtenerEvento } from '../utils/apiEventos.js'
import { datosDelResumen, obtenerEstadisticas } from '../utils/estadisticas.js'
import { diaYFecha, horario } from '../utils/fechas.js'

// Pantalla "/admin/:id": resumen del evento (ventas, recaudado, compras e ingresos) y sus acciones. Solo ADMIN.
export default function ResumenEvento({ usuario }) {
  const { id } = useParams()
  const token = usuario?.rol === 'ADMIN' ? usuario.token : null
  const [carga, setCarga] = useState({ estado: 'cargando' })

  useEffect(() => {
    if (!token) return undefined
    let activo = true
    obtenerEvento(id, token)
      .then((evento) => obtenerEstadisticas(token, id).then((estadisticas) => {
        if (activo) setCarga({ estado: 'listo', evento, estadisticas })
      }))
      .catch((fallo) => { if (activo) setCarga({ estado: 'error', mensaje: fallo.message, noExiste: [400, 404].includes(fallo.estado) }) })
    return () => { activo = false }
  }, [id, token])

  if (!token) return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  if (carga.estado === 'cargando') {
    return <main className="pagina admin"><p className="admin__cargando" role="status">Cargando evento…</p></main>
  }
  if (carga.estado === 'error') {
    return <Aviso mensaje={carga.noExiste ? 'No encontramos este evento.' : carga.mensaje} boton="Volver" to="/admin" />
  }

  const { evento, estadisticas } = carga
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
        </div>
      </div>
      <AvisoGuardado />
      <ul className="resumen__datos">
        {datosDelResumen(estadisticas).map((dato) => <DatoResumen key={dato.etiqueta} {...dato} />)}
      </ul>
      <p className="admin__seccion resumen__subtitulo">VENTAS POR ENTRADA</p>
      <VentasPorEntrada porEntrada={estadisticas.porEntrada} />
    </main>
  )
}
