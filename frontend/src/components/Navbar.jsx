import Logo from './Logo.jsx'
import NavLinks from './NavLinks.jsx'
import CarritoChip from './CarritoChip.jsx'
import CuentaChip from './CuentaChip.jsx'

// Header de todo el sitio. Cada pieza es otro componente: el Navbar solo las ordena.
// Zonas fijas: logo, enlaces y, a la derecha, un casillero para el carrito y otro para la cuenta.
// Los casilleros tienen siempre el mismo ancho (estén vacíos o no), así nada se corre al cambiar de pantalla o de sesión.
// El carrito aparece solo para el rol USER (el admin no compra).
export default function Navbar({ usuario, carrito, onSalir, onIrAPagar }) {
  return (
    <header className="navbar">
      <Logo />
      <nav className="navbar__nav" aria-label="Principal">
        <NavLinks rol={usuario?.rol} />
      </nav>
      <div className="navbar__acciones">
        <span className="navbar__separador" aria-hidden="true" />
        <div className="navbar__carrito">
          {usuario?.rol === 'USER' && <CarritoChip carrito={carrito} onIrAPagar={onIrAPagar} />}
        </div>
        <div className="navbar__cuenta">
          <CuentaChip usuario={usuario} onSalir={onSalir} />
        </div>
      </div>
    </header>
  )
}
