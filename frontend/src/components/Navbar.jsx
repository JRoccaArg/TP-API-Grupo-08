import Logo from './Logo.jsx'
import NavLinks from './NavLinks.jsx'
import CarritoChip from './CarritoChip.jsx'
import CuentaChip from './CuentaChip.jsx'

// Header de todo el sitio. Cada pieza es otro componente: el Navbar solo las ordena.
// El carrito aparece solo para el rol USER (el admin no compra).
export default function Navbar({ usuario, carrito, onSalir }) {
  return (
    <header className="navbar">
      <Logo />
      <nav className="navbar__nav" aria-label="Principal">
        <NavLinks rol={usuario?.rol} />
        <span className="navbar__separador" aria-hidden="true" />
        {usuario?.rol === 'USER' && <CarritoChip carrito={carrito} />}
        <CuentaChip usuario={usuario} onSalir={onSalir} />
      </nav>
    </header>
  )
}
