import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import EdicionLocacion from '../components/EdicionLocacion.jsx'
import { cargarLocacion } from '../utils/apiAdmin.js'

// Pantalla "/admin/locaciones/:id": carga la locación con sus fotos y se la pasa a EdicionLocacion. Solo ADMIN.
export default function EditarLocacion({ usuario }) {
  const { id } = useParams()
  const [carga, setCarga] = useState({ estado: 'cargando' })
  const esAdmin = usuario?.rol === 'ADMIN'

  useEffect(() => {
    if (!esAdmin) return undefined
    let activo = true
    cargarLocacion(id)
      .then((locacion) => { if (activo) setCarga({ estado: 'listo', locacion }) })
      .catch((fallo) => {
        if (activo) setCarga({ estado: 'error', mensaje: fallo.message, noExiste: [400, 404].includes(fallo.estado) })
      })
    return () => { activo = false }
  }, [id, esAdmin])

  if (!esAdmin) {
    return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }
  if (carga.estado === 'cargando') {
    return <main className="pagina admin"><p className="admin__cargando" role="status">Cargando locación…</p></main>
  }
  if (carga.estado === 'error') {
    return <Aviso mensaje={carga.noExiste ? 'No encontramos esta locación.' : carga.mensaje} boton="Volver" to="/admin/locaciones" />
  }
  return <EdicionLocacion locacion={carga.locacion} token={usuario.token} />
}
