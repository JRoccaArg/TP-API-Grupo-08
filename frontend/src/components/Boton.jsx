import { Link } from 'react-router-dom'

// Botón reutilizable. Con "to" navega (Link); sin "to" ejecuta onClick.
// "variante" cambia el aspecto: oro (relleno dorado), contorno u oscuro.
export default function Boton({
  to,
  onClick,
  tipo = 'button',
  variante = 'oro',
  clase = '',
  deshabilitado = false,
  children,
}) {
  const efectos = variante === 'oro' ? 'oro-relleno brillo' : ''
  const clases = `boton boton--${variante} ${efectos} ${clase}`

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={clases}>
        {children}
      </Link>
    )
  }
  return (
    <button type={tipo} onClick={onClick} disabled={deshabilitado} className={clases}>
      {children}
    </button>
  )
}
