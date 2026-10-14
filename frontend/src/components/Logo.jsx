import { Link } from 'react-router-dom'

export default function Logo({ clase = '' }) {
  return (
    <Link to="/" className={`logo ${clase}`} aria-label="Zenoir, ir al inicio">
      zenoir<span className="oro-texto">.</span>
    </Link>
  )
}
