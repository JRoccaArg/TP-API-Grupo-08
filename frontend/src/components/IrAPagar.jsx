import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Boton from './Boton.jsx'

// Botón "Ir a pagar": pide al back abrir el pago y, cuando responde, pasa a la pantalla de pago.
// onIrAPagar devuelve una promesa; si falla (por ejemplo, la venta se pausó) se muestra el mensaje del back acá mismo.
export default function IrAPagar({ onIrAPagar, onTerminar, clase = '', children }) {
  const navigate = useNavigate()
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')

  const ir = () => {
    setOcupado(true)
    setAviso('')
    onIrAPagar()
      .then(() => {
        if (onTerminar) onTerminar()
        navigate('/pago')
      })
      .catch((fallo) => {
        setAviso(fallo.message)
        setOcupado(false)
      })
  }

  return (
    <div className="ir-a-pagar">
      <Boton onClick={ir} deshabilitado={ocupado} clase={clase}>
        {ocupado ? 'Abriendo el pago…' : children}
      </Boton>
      {aviso && <p className="ir-a-pagar__aviso" role="alert">{aviso}</p>}
    </div>
  )
}
