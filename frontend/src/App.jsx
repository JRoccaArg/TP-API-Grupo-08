import { useEffect, useState } from 'react'
import Sitio from './Sitio.jsx'
import { avisarSiVenceLaSesion } from './utils/pedir.js'
import { borrarSesion, guardarSesion, leerSesion } from './utils/sesion.js'

// App guarda la sesión y se la pasa a Sitio (el carrito y las pantallas).
// La sesión arranca con lo que haya en localStorage (si hay una vigente), así sobrevive a recargar la página.
export default function App() {
  const [usuario, setUsuario] = useState(leerSesion)
  const [sesionVencida, setSesionVencida] = useState(false) // el back rechazó la sesión: se cerró y se avisa

  // Si el back responde 401 a un pedido con sesión, la sesión ya no sirve: se cierra y se muestra el aviso.
  useEffect(() => {
    avisarSiVenceLaSesion(() => {
      borrarSesion()
      setUsuario(null)
      setSesionVencida(true)
    })
  }, [])

  // Login y registro llaman a ingresar con la sesión que devolvió el backend ({ token, email, nombre, rol }).
  const ingresar = (sesion) => {
    guardarSesion(sesion)
    setUsuario(sesion)
    setSesionVencida(false)
  }
  const salir = () => {
    borrarSesion()
    setUsuario(null)
  }

  // Con otra sesión (o sin ninguna) el sitio empieza de cero: así el carrito de una persona nunca se ve en la sesión de otra.
  return <Sitio key={usuario ? usuario.token : 'sin-sesion'} usuario={usuario} sesionVencida={sesionVencida} onIngresar={ingresar} onSalir={salir} />
}
