import { useState } from 'react'
import Boton from './Boton.jsx'
import FormTipoEntrada from './FormTipoEntrada.jsx'
import { actualizarTipoEntrada } from '../utils/apiAdmin.js'
import { tipoAFormulario, validarTipo } from '../utils/formTipoEntrada.js'

// Edición de un tipo de entrada en su misma fila. Guarda en el back y avisa con onGuardado(tipo) lo que respondió.
export default function EdicionTipoEntrada({ tipo, token, onGuardado, onCancelar }) {
  const [datos, setDatos] = useState(tipoAFormulario(tipo))
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso('')
  }

  const guardar = () => {
    const problema = validarTipo(datos)
    if (problema) {
      setAviso(problema)
      return
    }
    setOcupado(true)
    actualizarTipoEntrada(token, tipo.id, datos)
      .then(onGuardado)
      .catch((fallo) => {
        setAviso(fallo.estado === 409 ? 'Ya existe otro tipo de entrada con ese nombre.' : fallo.message)
        setOcupado(false)
      })
  }

  return (
    <li className="fila-tipo fila-tipo--edicion">
      <FormTipoEntrada datos={datos} onCambiar={cambiar} conEstado />
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
      <div className="nuevo-tipo__acciones">
        <Boton variante="contorno" clase="boton--chico" deshabilitado={ocupado} onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton clase="boton--chico" deshabilitado={ocupado} onClick={guardar}>
          {ocupado ? 'Guardando…' : 'Guardar'}
        </Boton>
      </div>
    </li>
  )
}
