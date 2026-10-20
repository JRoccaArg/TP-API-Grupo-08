import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import EdicionEvento from '../components/EdicionEvento.jsx'
import { cargarEdicion } from '../utils/apiAdmin.js'

// Pantalla "/admin/:id/editar": carga el evento (y las listas de lugares y categorías) y se lo pasa a EdicionEvento. Solo ADMIN.
export default function EditarEvento({ usuario }) {
  const { id } = useParams()
  const [carga, setCarga] = useState({ estado: 'cargando' })
  const esAdmin = usuario?.rol === 'ADMIN'

  useEffect(() => {
    if (!esAdmin) return undefined
    let activo = true
    cargarEdicion(id)
      .then((resultado) => { if (activo) setCarga({ estado: 'listo', ...resultado }) })
      .catch((fallo) => {
        if (activo) setCarga({ estado: 'error', mensaje: fallo.message, noExiste: fallo.estado === 404 })
      })
    return () => { activo = false }
  }, [id, esAdmin])

  if (!esAdmin) {
    return <Aviso mensaje="Esta sección es solo para administradores." boton="Ingresar" to="/login" />
  }
  if (carga.estado === 'cargando') {
    return <main className="pagina admin"><p className="admin__cargando" role="status">Cargando evento…</p></main>
  }
  if (carga.estado === 'error') {
    return <Aviso mensaje={carga.noExiste ? 'No encontramos este evento.' : carga.mensaje} boton="Volver" to="/admin" />
  }
  return <EdicionEvento evento={carga.evento} locaciones={carga.locaciones} categorias={carga.categorias} token={usuario.token} />
}
