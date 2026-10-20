import { Link, useLocation } from 'react-router-dom'
import { estaActivo } from '../utils/enlaces.js'

// Un enlace del header. En el inicio, los que tienen "ancla" bajan a su sección;
// en las otras pantallas llevan al inicio con el ancla ("/#fotos") y la sección se encarga de bajar (MarcaSeccion).
export default function EnlaceNav({ enlace }) {
  const { pathname } = useLocation()
  const clase = `enlace-nav ${estaActivo(enlace, pathname) ? 'enlace-nav--activo oro-texto' : ''}`

  if (enlace.ancla && pathname === '/') {
    return (
      <a href={`#${enlace.ancla}`} className={clase}>
        {enlace.texto}
      </a>
    )
  }
  return (
    <Link to={enlace.ancla ? `/#${enlace.ancla}` : enlace.ruta} className={clase}>
      {enlace.texto}
    </Link>
  )
}
