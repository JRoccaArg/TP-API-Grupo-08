import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import BarraAcciones from '../components/BarraAcciones.jsx'
import FormularioLocacion from '../components/FormularioLocacion.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { crearLocacion } from '../utils/apiAdmin.js'
import { locacionVacia, validarLocacion } from '../utils/formLocacion.js'

// Pantalla "/admin/locaciones/nueva": el mismo formulario que editar, pero vacío. Al crear, pasa a la edición para cargar fotos. Solo ADMIN.
export default function NuevaLocacion({ usuario }) {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(locacionVacia)
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  if (usuario?.rol !== 'ADMIN') {
    return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso('')
  }

  const guardar = () => {
    const problema = validarLocacion(datos)
    if (problema) {
      setAviso(problema)
      return
    }
    setOcupado(true)
    crearLocacion(usuario.token, datos)
      .then((creada) => navigate(`/admin/locaciones/${creada.id}`))
      .catch((fallo) => {
        setAviso(fallo.estado === 409 ? 'Ya existe una locación con ese nombre.' : fallo.message)
        setOcupado(false)
      })
  }

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar locaciones', ruta: '/admin/locaciones' }, { texto: 'Nueva locación' }]}
        titulo="Nueva"
        resaltado="locación"
      />
      <div className="admin__columna admin__columna--sola">
        <FormularioLocacion datos={datos} onCambiar={cambiar} />
        <p className="fotos-admin__nota">Las fotos se suben después de crear la locación, en la pantalla de edición.</p>
      </div>
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
      <BarraAcciones textoGuardar={ocupado ? 'Creando…' : 'Crear locación'} volverA="/admin/locaciones" ocupado={ocupado} onGuardar={guardar} />
    </main>
  )
}
