import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Boton from './Boton.jsx'
import FormTipoEntrada from './FormTipoEntrada.jsx'
import { actualizarTipoEntrada } from '../redux/tiposEntradaSlice'
import { tipoAFormulario, validarTipo } from '../utils/formTipoEntrada.js'

export default function EdicionTipoEntrada({ tipo, onClose }) {
  const { sesion } = useSelector((state) => state.usuario)
  const dispatch = useDispatch()
  const [datos, setDatos] = useState(tipoAFormulario(tipo))
  const [aviso, setAviso] = useState('')

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
    dispatch(actualizarTipoEntrada({
      token: sesion.token, id: tipo.id, nombre: datos.nombre.trim(), descripcionBase: datos.descripcion.trim(), activo: datos.activo === 'true',
    }))
    onClose()
  }

  return (
    <li className="fila-tipo fila-tipo--edicion">
      <FormTipoEntrada datos={datos} onCambiar={cambiar} conEstado />
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
      <div className="nuevo-tipo__acciones">
        <Boton variante="contorno" clase="boton--chico" onClick={onClose}>
          Cancelar
        </Boton>
        <Boton clase="boton--chico" onClick={guardar}>
          Guardar
        </Boton>
      </div>
    </li>
  )
}
