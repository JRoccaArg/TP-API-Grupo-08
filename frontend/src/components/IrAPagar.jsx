import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Boton from './Boton.jsx'

// Pide al back abrir el pago y, cuando responde, pasa a la pantalla de pago. Si falla (ej. la venta se pausó) muestra el mensaje ahí mismo
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
