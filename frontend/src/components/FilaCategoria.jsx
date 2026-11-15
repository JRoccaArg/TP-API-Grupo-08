import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Boton from './Boton.jsx'
import EdicionCategoria from './EdicionCategoria.jsx'
import { eliminarCategoria } from '../redux/categoriasSlice'

// Una categoría de la lista del admin. Eliminar pide segunda confirmación; si tiene eventos el back no la borra y la lista muestra el error
export default function FilaCategoria({ categoria, token }) {
  const dispatch = useDispatch()
  const [editando, setEditando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const activa = categoria.activo !== false

  const eliminar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    dispatch(eliminarCategoria({ token, id: categoria.id }))
    setConfirmando(false)
  }

  if (editando) {
    return (
      <li className="fila-tipo fila-tipo--edicion">
        <EdicionCategoria categoria={categoria} token={token} onClose={() => setEditando(false)} />
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
        <Boton variante="contorno" clase="boton--chico" onClick={() => { setConfirmando(false); setEditando(true) }}>
          Editar
        </Boton>
        <Boton variante="peligro" clase="boton--chico" onClick={eliminar}>
          {confirmando ? 'Confirmar' : 'Eliminar'}
        </Boton>
      </div>
    </li>
  )
}
