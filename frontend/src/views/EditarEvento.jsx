import { useNavigate, useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import BarraAcciones from '../components/BarraAcciones.jsx'
import FormularioEvento from '../components/FormularioEvento.jsx'
import PanelEntradas from '../components/PanelEntradas.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { eventos } from '../data/eventos.js'
import { ofertas } from '../data/ofertas.js'

// Pantalla "/admin/:id": datos del evento a la izquierda y sus entradas a la derecha. Solo ADMIN.
export default function EditarEvento({ usuario }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const evento = eventos.find((e) => e.id === Number(id))

  if (usuario?.rol !== 'ADMIN') {
    return <Aviso mensaje="Esta sección es solo para administradores." boton="Ingresar" to="/login" />
  }
  if (!evento) return <Aviso mensaje="No encontramos este evento." boton="Volver" to="/admin" />

  const volver = () => navigate('/admin')

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar eventos', ruta: '/admin' }, { texto: evento.titulo }]}
        titulo="Editar"
        resaltado="evento"
      />
      <div className="admin__dos-columnas">
        <FormularioEvento evento={evento} />
        <PanelEntradas ofertas={ofertas.filter((o) => o.eventoId === evento.id)} />
      </div>
      <BarraAcciones textoGuardar="Guardar cambios" onGuardar={volver} onEliminar={volver} />
    </main>
  )
}
