import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Boton from './Boton.jsx'
import FormTipoEntrada from './FormTipoEntrada.jsx'
import { crearTipoEntrada } from '../redux/tiposEntradaSlice'
import { tipoVacio, validarTipo } from '../utils/formTipoEntrada.js'

// Alta de un tipo de entrada (en la pantalla de tipos y dentro del evento). Despacha y avisa con onCreado(nombre)
export default function NuevoTipoEntrada({ onCreado, onCancelar }) {
  const { sesion } = useSelector((state) => state.usuario)
  const dispatch = useDispatch()
  const [datos, setDatos] = useState(tipoVacio)
  const [aviso, setAviso] = useState('')

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso('')
  }

  const crear = (e) => {
    e.preventDefault()
    const problema = validarTipo(datos)
    if (problema) {
      setAviso(problema)
      return
    }
    dispatch(crearTipoEntrada({ token: sesion.token, nombre: datos.nombre.trim(), descripcionBase: datos.descripcion.trim(), activo: true }))
    onCreado(datos.nombre.trim())
  }

  return (
    <form className="nuevo-tipo" onSubmit={crear}>
      <p className="admin__seccion">NUEVO TIPO DE ENTRADA</p>
      <FormTipoEntrada datos={datos} onCambiar={cambiar} />
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
      <div className="nuevo-tipo__acciones">
        <Boton variante="contorno" clase="boton--chico" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton tipo="submit" clase="boton--chico">
          Crear tipo
        </Boton>
      </div>
    </form>
  )
}
