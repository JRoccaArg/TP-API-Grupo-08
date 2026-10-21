import Logo from './Logo.jsx'
import NavLinks from './NavLinks.jsx'
import CarritoChip from './CarritoChip.jsx'
import CuentaChip from './CuentaChip.jsx'

// Header de todo el sitio: cada pieza es otro componente y el Navbar solo las ordena. El carrito aparece solo para el rol USER.
// Los casilleros del carrito y de la cuenta tienen siempre el mismo ancho, así nada se corre al cambiar de pantalla o de sesión.
export default function Navbar({ usuario, carrito, eventos, onSalir, onIrAPagar }) {
  return (
    <header className="navbar">
      <Logo />
      <nav className="navbar__nav" aria-label="Principal">
        <NavLinks rol={usuario?.rol} />
      </nav>
      <div className="navbar__acciones">
        <span className="navbar__separador" aria-hidden="true" />
        <div className="navbar__carrito">
          {usuario?.rol === 'USER' && <CarritoChip carrito={carrito} eventos={eventos} onIrAPagar={onIrAPagar} />}
        </div>
        <div className="navbar__cuenta">
          <CuentaChip usuario={usuario} onSalir={onSalir} />
        </div>
      </div>
    </header>
  )
}
