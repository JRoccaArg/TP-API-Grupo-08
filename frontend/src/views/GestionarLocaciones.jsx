import { useEffect, useState } from 'react'
import Aviso from '../components/Aviso.jsx'
import AvisoGuardado from '../components/AvisoGuardado.jsx'
import Boton from '../components/Boton.jsx'
import FilaLocacionAdmin from '../components/FilaLocacionAdmin.jsx'
import Icono from '../components/Icono.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { obtenerLocacionesAdmin } from '../utils/apiAdmin.js'

// Pantalla "/admin/locaciones": los lugares donde se hacen los eventos, para editarlos o crear uno nuevo. Solo ADMIN.
export default function GestionarLocaciones({ usuario }) {
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')
  const esAdmin = usuario?.rol === 'ADMIN'

  useEffect(() => {
    if (!esAdmin) return undefined
    let activo = true
    obtenerLocacionesAdmin()
      .then((locaciones) => { if (activo) setLista(locaciones) })
      .catch((fallo) => { if (activo) setError(fallo.message) })
    return () => { activo = false }
  }, [esAdmin])

  if (!esAdmin) {
    return <Aviso mensaje="Esta sección es solo para administradores." boton="Ingresar" to="/login" />
  }

  return (
    <main className="pagina admin">
      <div className="admin__encabezado">
        <TituloAdmin titulo="Gestionar" resaltado="locaciones" bajada="Los lugares donde se hacen los eventos, con sus fotos." />
        <Boton to="/admin/locaciones/nueva" clase="boton--grande">
          <Icono nombre="mas" tamano={18} grosor={2.4} /> Nueva locación
        </Boton>
      </div>
      <AvisoGuardado />
      {error && <p className="admin__aviso admin__aviso--error" role="alert">{error}</p>}
      {!lista && !error && <p className="admin__cargando" role="status">Cargando locaciones…</p>}
      {lista && (
        <>
          <ul className="admin__lista">
            {lista.map((locacion) => (
              <FilaLocacionAdmin key={locacion.id} locacion={locacion} />
            ))}
          </ul>
          {lista.length === 0 && <p className="admin__vacio">Todavía no hay locaciones. Creá la primera.</p>}
          <p className="admin__pie">{lista.length === 1 ? '1 locación' : `${lista.length} locaciones`}</p>
        </>
      )}
    </main>
  )
}
