import { useEffect, useState } from 'react'
import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import EdicionCategoria from '../components/EdicionCategoria.jsx'
import FilaCategoria from '../components/FilaCategoria.jsx'
import Icono from '../components/Icono.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { obtenerCategorias } from '../utils/apiCategorias.js'

const porNombre = (lista) => [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

// Pantalla "/admin/categorias": las categorías de los eventos (crear, renombrar, activar o desactivar y eliminar). Solo ADMIN.
// También se crean solas al escribir una categoría nueva en el formulario de un evento.
export default function GestionarCategorias({ usuario }) {
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')
  const [creando, setCreando] = useState(false)
  const esAdmin = usuario?.rol === 'ADMIN'

  useEffect(() => {
    if (!esAdmin) return undefined
    let activo = true
    obtenerCategorias()
      .then((categorias) => { if (activo) setLista(categorias) })
      .catch((fallo) => { if (activo) setError(fallo.message) })
    return () => { activo = false }
  }, [esAdmin])

  if (!esAdmin) {
    return <Aviso mensaje="Esta sección es solo para administradores." boton="Ingresar" to="/login" />
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
      {!lista && !error && <p className="admin__cargando" role="status">Cargando categorías…</p>}
      {lista && (
        <>
          {creando && (
            <div className="nuevo-tipo">
              <EdicionCategoria
                token={usuario.token}
                onCancelar={() => setCreando(false)}
                onGuardado={(nueva) => {
                  setLista(porNombre([...lista, nueva]))
                  setCreando(false)
                }}
              />
            </div>
          )}
          <ul className="admin__lista">
            {lista.map((categoria) => (
              <FilaCategoria
                key={categoria.id}
                categoria={categoria}
                token={usuario.token}
                onActualizada={(actualizada) => setLista(porNombre(lista.map((otra) => (otra.id === actualizada.id ? actualizada : otra))))}
                onEliminada={(id) => setLista(lista.filter((otra) => otra.id !== id))}
              />
            ))}
          </ul>
          {lista.length === 0 && <p className="admin__vacio">Todavía no hay categorías. Creá la primera.</p>}
          <p className="admin__pie">{lista.length === 1 ? '1 categoría' : `${lista.length} categorías`}</p>
        </>
      )}
    </main>
  )
}
