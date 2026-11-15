import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { eliminarOferta } from '../redux/eventosSlice'
import { vendidas } from '../utils/formOferta.js'
import { precio } from '../utils/formatos.js'

// Una entrada ya cargada en el evento, con sus datos y las acciones de editarla o quitarla (quitar pide segunda confirmación).
// Si el back no la deja quitar (ya tiene ventas o reservas), el error queda en el evento y se ve abajo.
export default function ResumenOferta({ oferta, eventoId, onEditar }) {
  const { sesion } = useSelector((state) => state.usuario)
  const dispatch = useDispatch()
  const [confirmando, setConfirmando] = useState(false)
  const agotada = oferta.estado === 'AGOTADO' || oferta.cantidadDisponible === 0
  const descuento =
    oferta.porcentajeDescuento > 0 ? `${oferta.porcentajeDescuento}% de descuento` : 'sin descuento'

  const quitar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    dispatch(eliminarOferta({ token: sesion.token, eventoId, id: oferta.id }))
    setConfirmando(false)
  }

  return (
    <li className="oferta-admin">
      <div className="oferta-admin__titulo">
        <h3>{oferta.tipoEntradaNombre}</h3>
        <span className={agotada ? '' : 'oro-texto'}>{agotada ? 'AGOTADO' : oferta.estado}</span>
      </div>
      <p>
        {precio(oferta.precio)} · {descuento} · {vendidas(oferta)} de {oferta.cantidadTotal} vendidas
      </p>
      <div className="oferta-admin__acciones">
        <button type="button" onClick={onEditar}>Editar</button>
        <button type="button" className="oferta-admin__quitar" onClick={quitar}>
          {confirmando ? 'Confirmar: quitar' : 'Quitar'}
        </button>
      </div>
    </li>
  )
}
