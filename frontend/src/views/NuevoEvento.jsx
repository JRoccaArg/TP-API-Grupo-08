import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import BarraAcciones from '../components/BarraAcciones.jsx'
import FormularioEvento from '../components/FormularioEvento.jsx'
import PanelEntradas from '../components/PanelEntradas.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { cargarOpciones, crearEvento } from '../utils/apiAdmin.js'
import { formularioVacio, validarEvento } from '../utils/formEvento.js'

// Pantalla "/admin/nuevo": el mismo formulario que editar, pero vacío. Al crear, pasa a la edición para cargar fotos. Solo ADMIN.
export default function NuevoEvento({ usuario }) {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(formularioVacio)
  const [opciones, setOpciones] = useState(null)
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const esAdmin = usuario?.rol === 'ADMIN'

  useEffect(() => {
    if (!esAdmin) return undefined
    let activo = true
    cargarOpciones()
      .then((lista) => { if (activo) setOpciones(lista) })
      .catch((fallo) => { if (activo) setAviso(fallo.message) })
    return () => { activo = false }
  }, [esAdmin])

  if (!esAdmin) {
    return <Aviso mensaje="Esta sección es solo para administradores." boton="Ingresar" to="/login" />
  }

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso('')
  }

  const guardar = () => {
    const problema = validarEvento(datos)
    if (problema) {
      setAviso(problema)
      return
    }
    setOcupado(true)
    crearEvento(usuario.token, datos)
      .then((creado) => navigate(`/admin/${creado.id}`))
      .catch((fallo) => {
        setAviso(fallo.message)
        setOcupado(false)
      })
  }

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar eventos', ruta: '/admin' }, { texto: 'Nuevo evento' }]}
        titulo="Nuevo"
        resaltado="evento"
      />
      <div className="admin__dos-columnas">
        <div className="admin__columna">
          {opciones ? (
            <FormularioEvento datos={datos} onCambiar={cambiar} locaciones={opciones.locaciones} categorias={opciones.categorias} />
          ) : (
            <p className="admin__cargando" role="status">Cargando…</p>
          )}
          <p className="fotos-admin__nota">Las fotos se suben después de crear el evento, en la pantalla de edición.</p>
        </div>
        <PanelEntradas />
      </div>
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
      <BarraAcciones textoGuardar={ocupado ? 'Creando…' : 'Crear evento'} ocupado={ocupado || !opciones} onGuardar={guardar} />
    </main>
  )
}
