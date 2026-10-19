import { useState } from 'react'
import Sitio from './Sitio.jsx'
import { borrarSesion, guardarSesion, leerSesion } from './utils/sesion.js'

// App guarda la sesión y se la pasa a Sitio (el carrito y las pantallas).
// La sesión arranca con lo que haya en localStorage (si hay una vigente), así sobrevive a recargar la página.
export default function App() {
  const [usuario, setUsuario] = useState(leerSesion)

  // Login y registro llaman a ingresar con la sesión que devolvió el backend ({ token, email, nombre, rol }).
  const ingresar = (sesion) => {
    guardarSesion(sesion)
    setUsuario(sesion)
  }
  const salir = () => {
    borrarSesion()
    setUsuario(null)
  }

  return <Sitio usuario={usuario} onIngresar={ingresar} onSalir={salir} />
}
