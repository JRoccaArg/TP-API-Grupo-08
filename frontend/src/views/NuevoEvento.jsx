import { useNavigate } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import BarraAcciones from '../components/BarraAcciones.jsx'
import FormularioEvento from '../components/FormularioEvento.jsx'
import PanelEntradas from '../components/PanelEntradas.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'

// Pantalla "/admin/nuevo": el mismo formulario que editar, pero vacío. Solo ADMIN.
export default function NuevoEvento({ usuario }) {
  const navigate = useNavigate()

  if (usuario?.rol !== 'ADMIN') {
    return <Aviso mensaje="Esta sección es solo para administradores." boton="Ingresar" to="/login" />
  }

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar eventos', ruta: '/admin' }, { texto: 'Nuevo evento' }]}
        titulo="Nuevo"
        resaltado="evento"
      />
      <div className="admin__dos-columnas">
        <FormularioEvento />
        <PanelEntradas />
      </div>
      <BarraAcciones textoGuardar="Crear evento" onGuardar={() => navigate('/admin')} />
    </main>
  )
}
