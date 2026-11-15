import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import Sitio from './Sitio.jsx'
import { limpiarCarrito } from './redux/carritoSlice'
import { limpiarCompras } from './redux/comprasSlice'
import { avisarSiVenceLaSesion } from './utils/pedir.js'
import { borrarSesion, guardarSesion, leerSesion } from './utils/sesion.js'

// App guarda la sesión y se la pasa a Sitio. Arranca con la de localStorage (si sigue vigente), así sobrevive a recargar la página
export default function App() {
  const dispatch = useDispatch()
  const [usuario, setUsuario] = useState(leerSesion)
  const [sesionVencida, setSesionVencida] = useState(false)

  // Si el back responde 401 con la sesión iniciada, la sesión ya no sirve: se cierra, se borra lo de esa persona y se avisa
  useEffect(() => {
    avisarSiVenceLaSesion(() => {
      borrarSesion()
      dispatch(limpiarCarrito())
      dispatch(limpiarCompras())
      setUsuario(null)
      setSesionVencida(true)
    })
  }, [dispatch])

  const ingresar = (sesion) => {
    guardarSesion(sesion)
    setUsuario(sesion)
    setSesionVencida(false)
  }
  const salir = () => {
    borrarSesion()
    setUsuario(null)
  }

  // Con otra sesión (o sin ninguna) Sitio empieza de cero
  return <Sitio key={usuario ? usuario.token : 'sin-sesion'} usuario={usuario} sesionVencida={sesionVencida} onIngresar={ingresar} onSalir={salir} />
}
