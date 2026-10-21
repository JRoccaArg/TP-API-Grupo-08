import { useState } from 'react'
import Boton from './Boton.jsx'
import FormTipoEntrada from './FormTipoEntrada.jsx'
import { crearTipoEntrada } from '../utils/apiAdmin.js'
import { tipoVacio, validarTipo } from '../utils/formTipoEntrada.js'

// Alta de un tipo de entrada nuevo (se usa en la pantalla de tipos y dentro del evento). Queda guardado para cualquier otro evento. Avisa con onCreado(tipo)
export default function NuevoTipoEntrada({ token, onCreado, onCancelar }) {
  const [datos, setDatos] = useState(tipoVacio)
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso('')
  }

  const crear = () => {
    const problema = validarTipo(datos)
    if (problema) {
      setAviso(problema)
      return
    }
    setOcupado(true)
    crearTipoEntrada(token, datos)
      .then(onCreado)
      .catch((fallo) => {
        setAviso(fallo.estado === 409 ? 'Ya existe un tipo de entrada con ese nombre.' : fallo.message)
        setOcupado(false)
      })
  }

  return (
    <div className="nuevo-tipo">
      <p className="admin__seccion">NUEVO TIPO DE ENTRADA</p>
      <FormTipoEntrada datos={datos} onCambiar={cambiar} />
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
      <div className="nuevo-tipo__acciones">
        <Boton variante="contorno" clase="boton--chico" deshabilitado={ocupado} onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton clase="boton--chico" deshabilitado={ocupado} onClick={crear}>
          {ocupado ? 'Creando…' : 'Crear tipo'}
        </Boton>
      </div>
    </div>
  )
}
