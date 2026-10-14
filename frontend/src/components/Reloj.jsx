import { useEffect, useState } from 'react'
import { formatearTiempo } from '../utils/formatos.js'

// Cuenta regresiva hasta "vencimiento" (milisegundos). Se recalcula cada segundo.
export default function Reloj({ vencimiento }) {
  const [restante, setRestante] = useState(null)

  useEffect(() => {
    if (!vencimiento) return undefined
    const actualizar = () => setRestante(vencimiento - Date.now())
    actualizar()
    const intervalo = setInterval(actualizar, 1000)
    return () => clearInterval(intervalo)
  }, [vencimiento])

  if (!vencimiento || restante === null) return null
  return <span className="reloj">{formatearTiempo(restante)}</span>
}
