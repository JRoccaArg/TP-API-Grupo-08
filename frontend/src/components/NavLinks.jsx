import EnlaceNav from './EnlaceNav.jsx'
import { enlaces } from '../data/navegacion.js'

// Muestra los enlaces que le corresponden al rol (visitante, usuario o admin).
export default function NavLinks({ rol }) {
  return enlaces[rol || 'VISITANTE'].map((enlace) => <EnlaceNav key={enlace.texto} enlace={enlace} />)
}
