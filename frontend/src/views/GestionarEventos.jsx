import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import FilaEventoAdmin from '../components/FilaEventoAdmin.jsx'
import Icono from '../components/Icono.jsx'
import TabsFiltro from '../components/TabsFiltro.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { obtenerEventosAdmin } from '../redux/eventosSlice'

// Cada filtro trae su propia regla: para agregar uno nuevo solo se suma un objeto a la lista.
const FILTROS = [
  { id: 'todos', texto: 'Todos', coincide: () => true },
  { id: 'activos', texto: 'Activos', coincide: (evento) => evento.estado === 'ACTIVO' },
  { id: 'finalizados', texto: 'Finalizados', coincide: (evento) => evento.estado === 'FINALIZADO' },
  { id: 'borradores', texto: 'Borradores', coincide: (evento) => evento.estado === 'BORRADOR' },
]

// Pantalla "/admin": los eventos reales (cualquier estado) para editar o crear uno nuevo. Solo para el rol ADMIN.
export default function GestionarEventos({ usuario }) {
  const dispatch = useDispatch()
  const { items, todos, errorAdmin } = useSelector((state) => state.eventos)
  const [filtro, setFiltro] = useState('todos')
  const esAdmin = usuario?.rol === 'ADMIN'
  const token = esAdmin ? usuario.token : null
  // "todos" guarda los ids y los eventos están en items. Primero los más lejanos, como antes
  const lista = todos
    ? todos.map((id) => items.find((evento) => evento.id === id))
      .sort((a, b) => String(b.fechaHoraInicio).localeCompare(String(a.fechaHoraInicio)))
    : []

  // La lista del admin se pide una sola vez (con el token, así también vienen los borradores)
  useEffect(() => {
    if (token && todos === null) dispatch(obtenerEventosAdmin(token))
  }, [dispatch, token, todos])

  if (!esAdmin) {
    return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }
  const visibles = lista.filter(FILTROS.find((f) => f.id === filtro).coincide)

  return (
    <main className="pagina admin">
      <div className="admin__encabezado">
        <TituloAdmin titulo="Gestionar" resaltado="eventos" bajada="Editá los eventos publicados o creá uno nuevo." />
        <Boton to="/admin/nuevo" clase="boton--grande">
          <Icono nombre="mas" tamano={18} grosor={2.4} /> Nuevo evento
        </Boton>
      </div>
      {errorAdmin && (
        <div role="alert">
          <p className="admin__aviso admin__aviso--error">{errorAdmin}</p>
          {todos === null && <Boton onClick={() => dispatch(obtenerEventosAdmin(token))}>Reintentar</Boton>}
        </div>
      )}
      {todos === null && !errorAdmin && <p className="admin__cargando" role="status">Cargando eventos…</p>}
      {todos && (
        <>
          <TabsFiltro filtros={FILTROS} eventos={lista} activo={filtro} onElegir={setFiltro} />
          <ul className="admin__lista">
            {visibles.map((evento) => (
              <FilaEventoAdmin key={evento.id} evento={evento} token={token} />
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
