import EnlaceNav from './EnlaceNav.jsx'
import MenuNav from './MenuNav.jsx'
import { enlaces } from '../data/navegacion.js'

export default function NavLinks({ rol }) {
  return enlaces[rol || 'VISITANTE'].map((enlace) =>
    enlace.menu ? <MenuNav key={enlace.texto} enlace={enlace} /> : <EnlaceNav key={enlace.texto} enlace={enlace} />)
}
