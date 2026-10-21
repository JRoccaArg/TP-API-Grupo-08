import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BarraAcciones from './BarraAcciones.jsx'
import FormularioLocacion from './FormularioLocacion.jsx'
import FotosLocacion from './FotosLocacion.jsx'
import TituloAdmin from './TituloAdmin.jsx'
import { actualizarLocacion, eliminarLocacion } from '../utils/apiAdmin.js'
import { locacionAFormulario, validarLocacion } from '../utils/formLocacion.js'

export default function EdicionLocacion({ locacion, token }) {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(locacionAFormulario(locacion))
  const [aviso, setAviso] = useState({ tipo: '', texto: '' })
  const [ocupado, setOcupado] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso({ tipo: '', texto: '' })
  }

  const guardar = () => {
    const problema = validarLocacion(datos)
    if (problema) {
      setAviso({ tipo: 'error', texto: problema })
      return
    }
    setOcupado(true)
    setAviso({ tipo: '', texto: '' })
    actualizarLocacion(token, locacion.id, datos)
      .then((actualizada) => navigate('/admin/locaciones', { state: { aviso: `Guardaste los cambios de "${actualizada.nombre}".` } }))
      .catch((fallo) => {
        setAviso({ tipo: 'error', texto: fallo.estado === 409 ? 'Ya existe otra locación con ese nombre.' : fallo.message })
        setOcupado(false)
      })
  }

  // Eliminar pide segunda confirmación. Si la locación tiene eventos, el back responde 409 y no se borra
  const eliminar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    setOcupado(true)
    eliminarLocacion(token, locacion.id)
      .then(() => navigate('/admin/locaciones', { state: { aviso: `Eliminaste la locación "${locacion.nombre}".` } }))
      .catch((fallo) => {
        setConfirmando(false)
        setOcupado(false)
        setAviso({
          tipo: 'error',
          texto: fallo.estado === 409 ? 'No se puede eliminar: hay eventos en este lugar. Cambiales el lugar o eliminalos primero.' : fallo.message,
        })
      })
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
        <FotosLocacion locacionId={locacion.id} nombre={locacion.nombre} token={token} inicial={locacion.imagenes} />
      </div>
      {aviso.texto && <p className={`admin__aviso admin__aviso--${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>{aviso.texto}</p>}
      <BarraAcciones
        textoGuardar={ocupado ? 'Guardando…' : 'Guardar cambios'}
        textoEliminar={confirmando ? 'Confirmar: eliminar locación' : 'Eliminar locación'}
        volverA="/admin/locaciones"
        ocupado={ocupado}
        onGuardar={guardar}
        onEliminar={eliminar}
      />
    </main>
  )
}
