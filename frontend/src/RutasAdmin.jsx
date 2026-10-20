import { Route, Routes } from 'react-router-dom'
import Aviso from './components/Aviso.jsx'
import EditarEvento from './views/EditarEvento.jsx'
import EditarLocacion from './views/EditarLocacion.jsx'
import GestionarCategorias from './views/GestionarCategorias.jsx'
import GestionarEventos from './views/GestionarEventos.jsx'
import GestionarLocaciones from './views/GestionarLocaciones.jsx'
import GestionarTiposEntrada from './views/GestionarTiposEntrada.jsx'
import NuevaLocacion from './views/NuevaLocacion.jsx'
import NuevoEvento from './views/NuevoEvento.jsx'
import ResumenEvento from './views/ResumenEvento.jsx'

// Las pantallas del administrador, todas bajo "/admin". Cada una vuelve a revisar que el usuario sea ADMIN.
// Un evento: "/admin/:id" es su resumen (ventas y acciones) y "/admin/:id/editar" su edición.
export default function RutasAdmin({ usuario }) {
  return (
    <Routes>
      <Route index element={<GestionarEventos usuario={usuario} />} />
      <Route path="nuevo" element={<NuevoEvento usuario={usuario} />} />
      <Route path="locaciones" element={<GestionarLocaciones usuario={usuario} />} />
      <Route path="locaciones/nueva" element={<NuevaLocacion usuario={usuario} />} />
      <Route path="locaciones/:id" element={<EditarLocacion usuario={usuario} />} />
      <Route path="categorias" element={<GestionarCategorias usuario={usuario} />} />
      <Route path="tipos-entrada" element={<GestionarTiposEntrada usuario={usuario} />} />
      <Route path=":id" element={<ResumenEvento usuario={usuario} />} />
      <Route path=":id/editar" element={<EditarEvento usuario={usuario} />} />
      <Route path="*" element={<Aviso mensaje="Esta página no existe." boton="Ir al inicio" to="/" />} />
    </Routes>
  )
}
