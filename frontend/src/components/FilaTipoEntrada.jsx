import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Boton from './Boton.jsx'
import EdicionTipoEntrada from './EdicionTipoEntrada.jsx'
import { eliminarTipoEntrada } from '../redux/tiposEntradaSlice'

// Un tipo de entrada de la lista del admin. Eliminar pide segunda confirmación; si ya está en algún evento el back no lo borra
export default function FilaTipoEntrada({ tipo, token }) {
  const dispatch = useDispatch()
  const [editando, setEditando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const activo = tipo.activo !== false

  const eliminar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    dispatch(eliminarTipoEntrada({ token, id: tipo.id }))
    setConfirmando(false)
  }

  if (editando) {
    return <EdicionTipoEntrada tipo={tipo} token={token} onClose={() => setEditando(false)} />
  }

  return (
    <li className="fila-tipo">
      <div className="fila-tipo__datos">
        <h3>{tipo.nombre}</h3>
        <p>{tipo.descripcionBase}</p>
      </div>
      <p className={`fila-admin__estado ${activo ? 'oro-texto' : ''}`}>{activo ? 'ACTIVO' : 'INACTIVO'}</p>
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
