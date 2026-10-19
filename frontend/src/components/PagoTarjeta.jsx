import { useState } from 'react'
import FormTarjeta from './FormTarjeta.jsx'
import TarjetaVisual from './TarjetaVisual.jsx'

// Tarjeta + formulario. Sabe en qué campo está el cursor (para girar la tarjeta) y cuáles ya se tocaron
// (los errores se muestran al salir de un campo, o todos juntos cuando se intentó pagar).
export default function PagoTarjeta({ tarjeta, errores, mostrarTodos, onCambiar, onProbar }) {
  const [foco, setFoco] = useState('')
  const [tocados, setTocados] = useState({})

  const salir = (campo) => {
    setFoco('')
    setTocados({ ...tocados, [campo]: true })
  }

  const visibles = {}
  Object.keys(errores).forEach((campo) => {
    visibles[campo] = tocados[campo] || mostrarTodos ? errores[campo] : ''
  })

  return (
    <div className="pago-tarjeta">
      <TarjetaVisual tarjeta={tarjeta} foco={foco} />
      <FormTarjeta
        tarjeta={tarjeta}
        errores={visibles}
        onCambiar={onCambiar}
        onFoco={setFoco}
        onSalir={salir}
        onProbar={onProbar}
      />
    </div>
  )
}
