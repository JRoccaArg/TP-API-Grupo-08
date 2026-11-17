import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import BarraAcciones from '../components/BarraAcciones.jsx'
import FormularioLocacion from '../components/FormularioLocacion.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { crearLocacion } from '../redux/locacionesSlice'
import { locacionVacia, validarLocacion } from '../utils/formLocacion.js'

// Pantalla "/admin/locaciones/nueva": el mismo formulario que editar, pero vacío. Al crear vuelve a la lista. Solo ADMIN.
export default function NuevaLocacion() {
  const { sesion } = useSelector((state) => state.usuario)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [datos, setDatos] = useState(locacionVacia)
  const [aviso, setAviso] = useState('')

  if (sesion?.rol !== 'ADMIN') {
    return <AvisoAcceso usuario={sesion} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso('')
  }

  // Se frena el envío del navegador, se despacha y se vuelve a la lista: si el back la rechaza, la lista muestra el error
  const guardar = (e) => {
    e.preventDefault()
    const problema = validarLocacion(datos)
    if (problema) {
      setAviso(problema)
      return
    }
    dispatch(crearLocacion({ token: sesion.token, nombre: datos.nombre.trim(), direccion: datos.direccion.trim() }))
    navigate('/admin/locaciones')
  }

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar locaciones', ruta: '/admin/locaciones' }, { texto: 'Nueva locación' }]}
        titulo="Nueva"
        resaltado="locación"
      />
      <div className="admin__columna admin__columna--sola">
        <FormularioLocacion datos={datos} onCambiar={cambiar} onGuardar={guardar} />
        <p className="fotos-admin__nota">Las fotos se suben después de crear la locación, entrando a editarla desde la lista.</p>
      </div>
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
      <BarraAcciones textoGuardar="Crear locación" volverA="/admin/locaciones" formulario="form-locacion" />
    </main>
  )
}
