import Icono from './Icono.jsx'
import { evaluarClave } from '../utils/clave.js'

export default function ReglasClave({ clave }) {
  return (
    <ul className="reglas-clave" aria-label="Requisitos de la contraseña">
      {evaluarClave(clave).map((regla) => (
        <li key={regla.id} className={regla.cumple ? 'reglas-clave__ok' : ''}>
          <Icono nombre="tilde" tamano={14} grosor={2.6} />
          {regla.texto}
        </li>
      ))}
    </ul>
  )
}
