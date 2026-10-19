import { destinoTrasIngresar } from '../utils/seleccionPendiente.js'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Boton from '../components/Boton.jsx'
import CampoClave from '../components/CampoClave.jsx'
import CampoLinea from '../components/CampoLinea.jsx'
import LayoutAcceso from '../components/LayoutAcceso.jsx'
import { imagenes } from '../data/imagenes.js'
import { iniciarSesion } from '../utils/apiAuth.js'

// Pantalla "/login": valida las credenciales contra el backend y, si son correctas, App guarda la sesión.
export default function Login({ onIngresar }) {
  const navigate = useNavigate()
  const { state } = useLocation() // "volverA": la pantalla de verificación que mandó a ingresar (solo la usa el ADMIN)
  const [datos, setDatos] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cambiar = (evento) => setDatos({ ...datos, [evento.target.name]: evento.target.value })
  const enviar = (evento) => {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    iniciarSesion(datos.email, datos.password)
      .then((sesion) => {
        onIngresar(sesion)
        navigate(sesion.rol === 'ADMIN' && state?.volverA ? state.volverA : destinoTrasIngresar(sesion), { replace: true })
      })
      .catch((fallo) => {
        setError(fallo.message)
        setEnviando(false)
      })
  }

  return (
    <LayoutAcceso
      foto={imagenes.arana}
      alt="Araña de cristal del salón de Zenoir"
      titulo={<>Entrá a<br />la <span className="oro-texto">noche</span></>}
    >
      <h1 className="acceso__encabezado aparece">Ingresar</h1>
      <p className="acceso__bajada">Entrá para reservar tus entradas y ver tus QR.</p>
      <form className="acceso__form" onSubmit={enviar}>
        <CampoLinea etiqueta="EMAIL" nombre="email" tipo="email" valor={datos.email}
          onChange={cambiar} placeholder="tu@email.com" autoComplete="email" requerido />
        <CampoClave nombre="password" valor={datos.password} onChange={cambiar} placeholder="Tu contraseña"
          autoComplete="current-password" requerido />
        {error && <p className="acceso__error" role="alert">{error}</p>}
        <Boton tipo="submit" deshabilitado={enviando} clase="boton--ancho boton--grande">
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </Boton>
      </form>
      <p className="acceso__pie">
        ¿No tenés cuenta? <Link to="/registro" className="enlace-oro">Creá una</Link>
      </p>
      <p className="acceso__nota">Podés ver todas las fechas sin cuenta. Para comprar necesitás ingresar.</p>
    </LayoutAcceso>
  )
}
