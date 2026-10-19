import { useState } from 'react'
import Boton from './Boton.jsx'
import EdicionCategoria from './EdicionCategoria.jsx'
import { eliminarCategoria } from '../utils/apiCategorias.js'

// Una categoría en la lista del administrador: se ve, se edita ahí mismo (EdicionCategoria) o se elimina.
// Eliminar pide una segunda confirmación; si la categoría tiene eventos el back responde 409 y no se borra.
export default function FilaCategoria({ categoria, token, onActualizada, onEliminada }) {
  const [editando, setEditando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const activa = categoria.activo !== false

  const eliminar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    setOcupado(true)
    eliminarCategoria(token, categoria.id)
      .then(() => onEliminada(categoria.id))
      .catch((fallo) => {
        setConfirmando(false)
        setOcupado(false)
        setAviso(fallo.estado === 409
          ? 'Esta categoría tiene eventos y no se puede eliminar. Podés dejarla inactiva para que no se sugiera en eventos nuevos.'
          : fallo.message)
      })
  }

  if (editando) {
    return (
      <li className="fila-tipo fila-tipo--edicion">
        <EdicionCategoria
          categoria={categoria}
          token={token}
          onCancelar={() => setEditando(false)}
          onGuardado={(actualizada) => {
            onActualizada(actualizada)
            setEditando(false)
          }}
        />
      </li>
    )
  }

  return (
    <li className="fila-tipo">
      <div className="fila-tipo__datos">
        <h3>{categoria.nombre}</h3>
      </div>
      <p className={`fila-admin__estado ${activa ? 'oro-texto' : ''}`}>{activa ? 'ACTIVA' : 'INACTIVA'}</p>
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
