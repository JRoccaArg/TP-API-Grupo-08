import { useState } from 'react'
import CampoLinea from './CampoLinea.jsx'
import Icono from './Icono.jsx'

export default function CampoClave({ etiqueta = 'CONTRASEÑA', ...resto }) {
  const [visible, setVisible] = useState(false)
  const ojo = (
    <button
      type="button"
      className="campo__ojo"
      onClick={() => setVisible(!visible)}
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-pressed={visible}
    >
      <Icono nombre={visible ? 'ojoCerrado' : 'ojo'} tamano={20} />
    </button>
  )
  return <CampoLinea etiqueta={etiqueta} tipo={visible ? 'text' : 'password'} accion={ojo} {...resto} />
}
