import { useEffect, useState } from 'react'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import FilaTipoEntrada from '../components/FilaTipoEntrada.jsx'
import Icono from '../components/Icono.jsx'
import NuevoTipoEntrada from '../components/NuevoTipoEntrada.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { obtenerTiposEntrada } from '../utils/apiAdmin.js'

const porNombre = (lista) => [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre))

// Pantalla "/admin/tipos-entrada": los nombres de entrada que se pueden usar en cualquier evento. Solo ADMIN.
export default function GestionarTiposEntrada({ usuario }) {
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')
  const [creando, setCreando] = useState(false)
  const esAdmin = usuario?.rol === 'ADMIN'

  useEffect(() => {
    if (!esAdmin) return undefined
    let activo = true
    obtenerTiposEntrada()
      .then((tipos) => { if (activo) setLista(tipos) })
      .catch((fallo) => { if (activo) setError(fallo.message) })
    return () => { activo = false }
  }, [esAdmin])

  if (!esAdmin) {
    return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }

  return (
    <main className="pagina admin">
      <div className="admin__encabezado">
        <TituloAdmin
          titulo="Tipos de"
          resaltado="entrada"
          bajada="Los nombres de entrada que podés usar en cualquier evento. El precio y el cupo se definen en cada evento."
        />
        {!creando && (
          <Boton clase="boton--grande" onClick={() => setCreando(true)}>
            <Icono nombre="mas" tamano={18} grosor={2.4} /> Nuevo tipo
          </Boton>
        )}
      </div>
      {error && <p className="admin__aviso admin__aviso--error" role="alert">{error}</p>}
      {!lista && !error && <p className="admin__cargando" role="status">Cargando tipos de entrada…</p>}
      {lista && (
        <>
          {creando && (
            <NuevoTipoEntrada
              token={usuario.token}
              onCancelar={() => setCreando(false)}
              onCreado={(tipo) => {
                setLista(porNombre([...lista, tipo]))
                setCreando(false)
              }}
            />
          )}
          <ul className="admin__lista">
            {lista.map((tipo) => (
              <FilaTipoEntrada
                key={tipo.id}
                tipo={tipo}
                token={usuario.token}
                onActualizado={(actualizado) => setLista(porNombre(lista.map((otro) => (otro.id === actualizado.id ? actualizado : otro))))}
                onEliminado={(id) => setLista(lista.filter((otro) => otro.id !== id))}
              />
            ))}
          </ul>
          {lista.length === 0 && <p className="admin__vacio">Todavía no hay tipos de entrada. Creá el primero.</p>}
          <p className="admin__pie">{lista.length === 1 ? '1 tipo de entrada' : `${lista.length} tipos de entrada`}</p>
        </>
      )}
    </main>
  )
}
