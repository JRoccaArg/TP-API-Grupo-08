import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import FilaLocacionAdmin from '../components/FilaLocacionAdmin.jsx'
import Icono from '../components/Icono.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { obtenerLocaciones } from '../redux/locacionesSlice'

// Pantalla "/admin/locaciones": los lugares donde se hacen los eventos, para editarlos o crear uno nuevo. Solo ADMIN.
export default function GestionarLocaciones({ usuario }) {
  const dispatch = useDispatch()
  const { items, loading, error, cargado } = useSelector((state) => state.locaciones)
  const esAdmin = usuario?.rol === 'ADMIN'
  const lista = [...items].sort((a, b) => a.nombre.localeCompare(b.nombre))

  // Si ya están en el store (por ejemplo, desde el inicio) no se vuelven a pedir
  useEffect(() => {
    if (esAdmin && !cargado) dispatch(obtenerLocaciones())
  }, [dispatch, esAdmin, cargado])

  if (!esAdmin) {
    return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }

  return (
    <main className="pagina admin">
      <div className="admin__encabezado">
        <TituloAdmin titulo="Gestionar" resaltado="locaciones" bajada="Los lugares donde se hacen los eventos, con sus fotos." />
        <Boton to="/admin/locaciones/nueva" clase="boton--grande">
          <Icono nombre="mas" tamano={18} grosor={2.4} /> Nueva locación
        </Boton>
      </div>
      {error && <p className="admin__aviso admin__aviso--error" role="alert">{error}</p>}
      {loading && <p className="admin__cargando" role="status">Cargando locaciones…</p>}
      {cargado && (
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
