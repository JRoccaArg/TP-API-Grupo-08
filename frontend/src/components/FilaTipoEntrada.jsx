import { useState } from 'react'
import Boton from './Boton.jsx'
import EdicionTipoEntrada from './EdicionTipoEntrada.jsx'
import { eliminarTipoEntrada } from '../utils/apiAdmin.js'

// Un tipo de entrada de la lista del admin. Eliminar pide segunda confirmación; si ya está en algún evento el back responde 409
export default function FilaTipoEntrada({ tipo, token, onActualizado, onEliminado }) {
  const [editando, setEditando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const activo = tipo.activo !== false

  const eliminar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    setOcupado(true)
    eliminarTipoEntrada(token, tipo.id)
      .then(() => onEliminado(tipo.id))
      .catch((fallo) => {
        setConfirmando(false)
        setOcupado(false)
        setAviso(fallo.estado === 409
          ? 'Este tipo está en uno o más eventos y no se puede eliminar. Podés dejarlo inactivo para que no se ofrezca en eventos nuevos.'
          : fallo.message)
      })
  }

  if (editando) {
    return (
      <EdicionTipoEntrada
        tipo={tipo}
        token={token}
        onCancelar={() => setEditando(false)}
        onGuardado={(actualizado) => {
          onActualizado(actualizado)
          setEditando(false)
        }}
      />
    )
  }

  return (
    <li className="fila-tipo">
      <div className="fila-tipo__datos">
        <h3>{tipo.nombre}</h3>
        <p>{tipo.descripcionBase}</p>
      </div>
      <p className={`fila-admin__estado ${activo ? 'oro-texto' : ''}`}>{activo ? 'ACTIVO' : 'INACTIVO'}</p>
      <div className="fila-admin__acciones">
        <Boton variante="contorno" clase="boton--chico" deshabilitado={ocupado} onClick={() => { setAviso(''); setConfirmando(false); setEditando(true) }}>
          Editar
        </Boton>
        <Boton variante="peligro" clase="boton--chico" deshabilitado={ocupado} onClick={eliminar}>
          {confirmando ? 'Confirmar' : 'Eliminar'}
        </Boton>
      </div>
      {aviso && <p className="admin__aviso admin__aviso--error fila-tipo__aviso" role="alert">{aviso}</p>}
    </li>
  )
}
