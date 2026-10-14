import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

// Estructura de login y registro: foto con el logo a la izquierda y el formulario a la derecha.
// El formulario entra como "children": así este componente se reutiliza sin tocarlo.
export default function LayoutAcceso({ foto, alt, titulo, children }) {
  return (
    <div className="acceso">
      <div className="acceso__foto">
        <img className="ken" src={foto} alt={alt} />
        <Logo clase="acceso__logo" />
        <p className="acceso__titulo aparece">{titulo}</p>
      </div>
      <div className="acceso__panel">
        <Link to="/" className="acceso__volver">
          Volver al inicio
        </Link>
        <div className="acceso__contenido">{children}</div>
      </div>
    </div>
  )
}
