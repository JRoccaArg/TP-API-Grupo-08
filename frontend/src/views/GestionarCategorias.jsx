import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import EdicionCategoria from '../components/EdicionCategoria.jsx'
import FilaCategoria from '../components/FilaCategoria.jsx'
import Icono from '../components/Icono.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { obtenerCategorias } from '../redux/categoriasSlice'

// Pantalla "/admin/categorias": las categorías de los eventos (crear, renombrar, activar o desactivar y eliminar). Solo ADMIN.
export default function GestionarCategorias({ usuario }) {
  const dispatch = useDispatch()
  const { items, loading, error, cargado } = useSelector((state) => state.categorias)
  const [creando, setCreando] = useState(false)
  const esAdmin = usuario?.rol === 'ADMIN'
  const lista = [...items].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  // Si ya están en el store no se vuelven a pedir
  useEffect(() => {
    if (esAdmin && !cargado) dispatch(obtenerCategorias())
  }, [dispatch, esAdmin, cargado])

  if (!esAdmin) {
    return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }

  return (
    <main className="pagina admin">
      <div className="admin__encabezado">
        <TituloAdmin titulo="Categorías" bajada="Agrupan los eventos en el catálogo. Una categoría inactiva no se sugiere en eventos nuevos." />
        {!creando && (
          <Boton clase="boton--grande" onClick={() => setCreando(true)}>
            <Icono nombre="mas" tamano={18} grosor={2.4} /> Nueva categoría
          </Boton>
        )}
      </div>
      {error && <p className="admin__aviso admin__aviso--error" role="alert">{error}</p>}
      {loading && <p className="admin__cargando" role="status">Cargando categorías…</p>}
      {cargado && (
        <>
          {creando && (
            <div className="nuevo-tipo">
              <EdicionCategoria token={usuario.token} onClose={() => setCreando(false)} />
            </div>
          )}
          <ul className="admin__lista">
            {lista.map((categoria) => (
              <FilaCategoria key={categoria.id} categoria={categoria} token={usuario.token} />
            ))}
          </ul>
          {lista.length === 0 && <p className="admin__vacio">Todavía no hay categorías. Creá la primera.</p>}
          <p className="admin__pie">{lista.length === 1 ? '1 categoría' : `${lista.length} categorías`}</p>
        </>
      )}
    </main>
  )
}
