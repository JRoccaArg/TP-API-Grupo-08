import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BarraAcciones from './BarraAcciones.jsx'
import FormularioEvento from './FormularioEvento.jsx'
import ImagenesEvento from './ImagenesEvento.jsx'
import PanelEntradas from './PanelEntradas.jsx'
import TituloAdmin from './TituloAdmin.jsx'
import { actualizarEvento, eliminarEvento } from '../utils/apiAdmin.js'
import { eventoAFormulario, validarEvento } from '../utils/formEvento.js'
import { guardarEvento } from '../utils/guardarEvento.js'

// Edición de un evento ya cargado: sus datos, sus fotos y sus entradas. Guarda y elimina con lo que responde el back.
// "opciones" (lugares y categorías) suma lo que se crea al guardar, para no intentar crearlo de nuevo en el próximo guardado.
export default function EdicionEvento({ evento: inicial, locaciones, categorias, token }) {
  const navigate = useNavigate()
  const [evento, setEvento] = useState(inicial)
  const [opciones, setOpciones] = useState({ locaciones, categorias })
  const [datos, setDatos] = useState(eventoAFormulario(inicial))
  const [aviso, setAviso] = useState({ tipo: '', texto: '' })
  const [ocupado, setOcupado] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso({ tipo: '', texto: '' })
  }

  const guardar = () => {
    const problema = validarEvento(datos, opciones)
    if (problema) {
      setAviso({ tipo: 'error', texto: problema })
      return
    }
    setOcupado(true)
    setAviso({ tipo: '', texto: '' })
    guardarEvento(token, datos, opciones, (conIds) => actualizarEvento(token, evento.id, conIds))
      .then(({ evento: actualizado, opciones: nuevas }) => {
        setEvento({ ...evento, ...actualizado })
        setOpciones(nuevas)
        setAviso({ tipo: 'ok', texto: 'Cambios guardados.' })
        setOcupado(false)
      })
      .catch((fallo) => {
        setAviso({ tipo: 'error', texto: fallo.message })
        setOcupado(false)
      })
  }

  // Eliminar pide una segunda confirmación: el primer clic cambia el texto del botón, el segundo borra.
  const eliminar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    setOcupado(true)
    eliminarEvento(token, evento.id)
      .then(() => navigate('/admin'))
      .catch((fallo) => {
        setConfirmando(false)
        setOcupado(false)
        setAviso({ tipo: 'error', texto: fallo.message })
      })
  }

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar eventos', ruta: '/admin' }, { texto: evento.titulo }]}
        titulo="Editar"
        resaltado="evento"
      />
      <div className="admin__dos-columnas">
        <div className="admin__columna">
          <FormularioEvento datos={datos} onCambiar={cambiar} locaciones={opciones.locaciones} categorias={opciones.categorias} />
          <ImagenesEvento eventoId={evento.id} titulo={evento.titulo} token={token} inicial={evento.imagenes} />
        </div>
        <PanelEntradas evento={evento} token={token} />
      </div>
      {aviso.texto && <p className={`admin__aviso admin__aviso--${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>{aviso.texto}</p>}
      <BarraAcciones
        textoGuardar={ocupado ? 'Guardando…' : 'Guardar cambios'}
        textoEliminar={confirmando ? 'Confirmar: eliminar evento' : 'Eliminar evento'}
        ocupado={ocupado}
        onGuardar={guardar}
        onEliminar={eliminar}
      />
    </main>
  )
}
