import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import BarraAcciones from './BarraAcciones.jsx'
import FormularioLocacion from './FormularioLocacion.jsx'
import FotosLocacion from './FotosLocacion.jsx'
import TituloAdmin from './TituloAdmin.jsx'
import { actualizarLocacion, eliminarLocacion } from '../redux/locacionesSlice'
import { locacionAFormulario, validarLocacion } from '../utils/formLocacion.js'

// Guardar y eliminar despachan y vuelven a la lista; si el back los rechaza, el error queda en la locación y se ve en su fila
export default function EdicionLocacion({ locacion }) {
  const { sesion } = useSelector((state) => state.usuario)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [datos, setDatos] = useState(locacionAFormulario(locacion))
  const [aviso, setAviso] = useState('')
  const [confirmando, setConfirmando] = useState(false)

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
    dispatch(actualizarLocacion({ token: sesion.token, id: locacion.id, nombre: datos.nombre.trim(), direccion: datos.direccion.trim() }))
    navigate('/admin/locaciones')
  }

  // Eliminar pide segunda confirmación. Si la locación tiene eventos, el back no la borra
  const eliminar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    dispatch(eliminarLocacion({ token: sesion.token, id: locacion.id }))
    navigate('/admin/locaciones')
  }

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar locaciones', ruta: '/admin/locaciones' }, { texto: locacion.nombre }]}
        titulo="Editar"
        resaltado="locación"
      />
      <div className="admin__columna admin__columna--sola">
        <FormularioLocacion datos={datos} onCambiar={cambiar} />
        <FotosLocacion locacion={locacion} />
      </div>
      {(aviso || locacion.errorEdicion) && (
        <p className="admin__aviso admin__aviso--error" role="alert">{aviso || locacion.errorEdicion}</p>
      )}
      <BarraAcciones
        textoGuardar="Guardar cambios"
        textoEliminar={confirmando ? 'Confirmar: eliminar locación' : 'Eliminar locación'}
        volverA="/admin/locaciones"
        onGuardar={guardar}
        onEliminar={eliminar}
      />
    </main>
  )
}
