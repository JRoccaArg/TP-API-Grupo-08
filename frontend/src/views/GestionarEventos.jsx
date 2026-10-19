import { useEffect, useState } from 'react'
import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import FilaEventoAdmin from '../components/FilaEventoAdmin.jsx'
import Icono from '../components/Icono.jsx'
import TabsFiltro from '../components/TabsFiltro.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { obtenerEventosAdmin } from '../utils/apiAdmin.js'

// Cada filtro trae su propia regla: para agregar uno nuevo solo se suma un objeto a la lista.
const FILTROS = [
  { id: 'todos', texto: 'Todos', coincide: () => true },
  { id: 'activos', texto: 'Activos', coincide: (evento) => evento.estado === 'ACTIVO' },
  { id: 'finalizados', texto: 'Finalizados', coincide: (evento) => evento.estado === 'FINALIZADO' },
  { id: 'borradores', texto: 'Borradores', coincide: (evento) => evento.estado === 'BORRADOR' },
]

// Pantalla "/admin": los eventos reales (cualquier estado) para editar o crear uno nuevo. Solo para el rol ADMIN.
export default function GestionarEventos({ usuario }) {
  const [filtro, setFiltro] = useState('todos')
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')
  const esAdmin = usuario?.rol === 'ADMIN'

  useEffect(() => {
    if (!esAdmin) return undefined
    let activo = true
    obtenerEventosAdmin()
      .then((eventos) => { if (activo) setLista(eventos) })
      .catch((fallo) => { if (activo) setError(fallo.message) })
    return () => { activo = false }
  }, [esAdmin])

  if (!esAdmin) {
    return <Aviso mensaje="Esta sección es solo para administradores." boton="Ingresar" to="/login" />
  }
  const visibles = lista ? lista.filter(FILTROS.find((f) => f.id === filtro).coincide) : []

  return (
    <main className="pagina admin">
      <div className="admin__encabezado">
        <TituloAdmin titulo="Gestionar" resaltado="eventos" bajada="Editá los eventos publicados o creá uno nuevo." />
        <Boton to="/admin/nuevo" clase="boton--grande">
          <Icono nombre="mas" tamano={18} grosor={2.4} /> Nuevo evento
        </Boton>
      </div>
      {error && <p className="admin__aviso admin__aviso--error" role="alert">{error}</p>}
      {!lista && !error && <p className="admin__cargando" role="status">Cargando eventos…</p>}
      {lista && (
        <>
          <TabsFiltro filtros={FILTROS} eventos={lista} activo={filtro} onElegir={setFiltro} />
          <ul className="admin__lista">
            {visibles.map((evento) => (
              <FilaEventoAdmin key={evento.id} evento={evento} />
            ))}
          </ul>
          {visibles.length === 0 && <p className="admin__vacio">No hay eventos en esta lista.</p>}
          <p className="admin__pie">
            Mostrando {visibles.length} de {lista.length} eventos
          </p>
        </>
      )}
    </main>
  )
}
