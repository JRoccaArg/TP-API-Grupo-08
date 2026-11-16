import { useSelector } from 'react-redux'
import Logo from './Logo.jsx'
import NavLinks from './NavLinks.jsx'
import CarritoChip from './CarritoChip.jsx'
import CuentaChip from './CuentaChip.jsx'

// Header de todo el sitio: cada pieza es otro componente y el Navbar solo las ordena. El carrito aparece solo para el rol USER.
// Los casilleros del carrito y de la cuenta tienen siempre el mismo ancho, así nada se corre al cambiar de pantalla o de sesión.
export default function Navbar() {
  const { sesion } = useSelector((state) => state.usuario)
  return (
    <header className="navbar">
      <Logo />
      <nav className="navbar__nav" aria-label="Principal">
        <NavLinks rol={sesion?.rol} />
      </nav>
      <div className="navbar__acciones">
        <span className="navbar__separador" aria-hidden="true" />
        <div className="navbar__carrito">
          {sesion?.rol === 'USER' && <CarritoChip />}
        </div>
        <div className="navbar__cuenta">
          <CuentaChip />
        </div>
      </div>
    </header>
  )
}
