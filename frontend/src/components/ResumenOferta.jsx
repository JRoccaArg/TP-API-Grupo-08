import { useState } from 'react'
import { eliminarOferta } from '../utils/apiAdmin.js'
import { vendidas } from '../utils/formOferta.js'
import { precio } from '../utils/formatos.js'

// Una entrada ya cargada en el evento, con sus datos y las acciones de editarla o quitarla.
// Quitar pide una segunda confirmación y se hace acá mismo; avisa con onQuitada(id) cuando el back la borró.
export default function ResumenOferta({ oferta, token, onEditar, onQuitada }) {
  const [confirmando, setConfirmando] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')
  const agotada = oferta.estado === 'AGOTADO' || oferta.cantidadDisponible === 0
  const descuento =
    oferta.porcentajeDescuento > 0 ? `${oferta.porcentajeDescuento}% de descuento` : 'sin descuento'

  const quitar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    setOcupado(true)
    setAviso('')
    eliminarOferta(token, oferta.id)
      .then(() => onQuitada(oferta.id))
      .catch((fallo) => {
        setAviso(fallo.estado === 409 ? 'No se puede quitar: ya tiene ventas o reservas. Podés pausarla desde Editar.' : fallo.message)
        setConfirmando(false)
        setOcupado(false)
      })
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
        <button type="button" disabled={ocupado} onClick={onEditar}>Editar</button>
        <button type="button" className="oferta-admin__quitar" disabled={ocupado} onClick={quitar}>
          {confirmando ? 'Confirmar: quitar' : 'Quitar'}
        </button>
      </div>
      {aviso && <p className="oferta-admin__aviso" role="alert">{aviso}</p>}
    </li>
  )
}
