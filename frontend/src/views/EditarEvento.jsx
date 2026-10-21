import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import EdicionEvento from '../components/EdicionEvento.jsx'
import { cargarEdicion } from '../utils/apiAdmin.js'

// Pantalla "/admin/:id/editar": carga el evento (y las listas de lugares y categorías) y se lo pasa a EdicionEvento. Solo ADMIN.
export default function EditarEvento({ usuario }) {
  const { id } = useParams()
  const [carga, setCarga] = useState({ estado: 'cargando' })
  const esAdmin = usuario?.rol === 'ADMIN'
  const token = esAdmin ? usuario.token : null

  useEffect(() => {
    if (!token) return undefined
    let activo = true
    cargarEdicion(id, token)
      .then((resultado) => { if (activo) setCarga({ estado: 'listo', ...resultado }) })
      .catch((fallo) => {
        if (activo) setCarga({ estado: 'error', mensaje: fallo.message, noExiste: [400, 404].includes(fallo.estado) })
      })
    return () => { activo = false }
  }, [id, token])

  if (!esAdmin) {
    return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }
  if (carga.estado === 'cargando') {
    return <main className="pagina admin"><p className="admin__cargando" role="status">Cargando evento…</p></main>
  }
  if (carga.estado === 'error') {
    return <Aviso mensaje={carga.noExiste ? 'No encontramos este evento.' : carga.mensaje} boton="Volver" to="/admin" />
  }
  return <EdicionEvento evento={carga.evento} locaciones={carga.locaciones} categorias={carga.categorias} token={usuario.token} />
}
