import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icono from './Icono.jsx'
import { estaActivo } from '../utils/enlaces.js'

// Enlace del header que abre un desplegable con otros enlaces. Se cierra al elegir uno, con Escape o al hacer clic afuera:
// para eso, mientras está abierto, hay un fondo transparente que ocupa toda la pantalla y cierra el menú al tocarlo.
export default function MenuNav({ enlace }) {
  const [abierto, setAbierto] = useState(false)
  const { pathname } = useLocation()
  const activo = enlace.menu.some((item) => estaActivo(item, pathname))

  return (
    <div className="menu-nav" onKeyDown={(evento) => evento.key === 'Escape' && setAbierto(false)}>
      <button
        type="button"
        className={`menu-nav__boton ${activo ? 'menu-nav__boton--activo oro-texto' : ''}`}
        aria-expanded={abierto}
        aria-haspopup="true"
        onClick={() => setAbierto(!abierto)}
      >
        {enlace.texto}
        <Icono nombre="chevron" tamano={14} grosor={2} />
      </button>
      {abierto && (
        <>
          <button type="button" className="menu-nav__fondo" aria-label="Cerrar menú" tabIndex={-1} onClick={() => setAbierto(false)} />
          <ul className="menu-nav__panel aparece-rapido">
            {enlace.menu.map((item) => (
              <li key={item.texto}>
                <Link
                  to={item.ruta}
                  className={`menu-nav__item ${estaActivo(item, pathname) ? 'menu-nav__item--activo' : ''}`}
                  onClick={() => setAbierto(false)}
                >
                  {item.texto}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
