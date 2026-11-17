import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import BarraAcciones from './BarraAcciones.jsx'
import FormularioEvento from './FormularioEvento.jsx'
import ImagenesEvento from './ImagenesEvento.jsx'
import PanelEntradas from './PanelEntradas.jsx'
import TituloAdmin from './TituloAdmin.jsx'
import { actualizarEvento, eliminarEvento } from '../redux/eventosSlice'
import { eventoAFormulario, formularioAEvento, validarEvento } from '../utils/formEvento.js'

export default function EdicionEvento({ evento, locaciones, categorias }) {
  const { sesion } = useSelector((state) => state.usuario)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [datos, setDatos] = useState(eventoAFormulario(evento))
  const [aviso, setAviso] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso('')
  }

  // Se frena el envío del navegador, se despacha y se vuelve al resumen del evento; si el back lo rechaza, el resumen muestra el error.
  // Si cambió el fin, el back corre solo el cierre de venta de sus entradas.
  const guardar = (e) => {
    e.preventDefault()
    const problema = validarEvento(datos, { locaciones, categorias })
    if (problema) {
      setAviso(problema)
      return
    }
    dispatch(actualizarEvento({ token: sesion.token, id: evento.id, ...formularioAEvento(datos, { locaciones, categorias }) }))
    navigate(`/admin/${evento.id}`)
  }

  // Eliminar pide una segunda confirmación: el primer clic cambia el texto del botón, el segundo borra.
  // Si el back no lo deja (por ejemplo, porque tiene entradas), el error se ve en su fila de la lista.
  const eliminar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    dispatch(eliminarEvento({ token: sesion.token, id: evento.id }))
    navigate('/admin')
  }

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar eventos', ruta: '/admin' }, { texto: evento.titulo, ruta: `/admin/${evento.id}` }, { texto: 'Editar' }]}
        titulo="Editar"
        resaltado="evento"
      />
      <div className="admin__dos-columnas">
        <div className="admin__columna">
          <FormularioEvento datos={datos} onCambiar={cambiar} onGuardar={guardar} locaciones={locaciones} categorias={categorias} />
          <ImagenesEvento evento={evento} />
        </div>
        <PanelEntradas evento={evento} />
      </div>
      {(aviso || evento.errorEdicion) && (
        <p className="admin__aviso admin__aviso--error" role="alert">{aviso || evento.errorEdicion}</p>
      )}
      <BarraAcciones
        textoGuardar="Guardar cambios"
        textoEliminar={confirmando ? 'Confirmar: eliminar evento' : 'Eliminar evento'}
        formulario="form-evento"
        onEliminar={eliminar}
      />
    </main>
  )
}
