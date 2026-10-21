import { destinoTrasIngresar } from '../utils/seleccionPendiente.js'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Boton from '../components/Boton.jsx'
import CampoClave from '../components/CampoClave.jsx'
import CampoLinea from '../components/CampoLinea.jsx'
import FuerzaClave from '../components/FuerzaClave.jsx'
import LayoutAcceso from '../components/LayoutAcceso.jsx'
import ReglasClave from '../components/ReglasClave.jsx'
import { imagenes } from '../data/imagenes.js'
import { registrarse } from '../utils/apiAuth.js'
import { claveValida } from '../utils/clave.js'
import { validarRegistro } from '../utils/registro.js'

const VACIO = { firstname: '', lastname: '', dni: '', fechaNacimiento: '', email: '', password: '' }

// Pantalla "/registro". Los nombres de los campos son los que pide el backend en /api/v1/auth/register.
// Al registrarse el backend ya devuelve el token: la persona queda con la sesión iniciada.
export default function Registro({ onIngresar }) {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(VACIO)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cambiar = (evento) => setDatos({ ...datos, [evento.target.name]: evento.target.value })
  const enviar = (evento) => {
    evento.preventDefault()
    setError('')
    const problema = validarRegistro(datos)
    if (problema) {
      setError(problema)
      return
    }
    if (!claveValida(datos.password)) {
      setError('La contraseña todavía no cumple los requisitos.')
      return
    }
    setEnviando(true)
    registrarse(datos)
      .then((sesion) => {
        onIngresar(sesion)
        navigate(destinoTrasIngresar(sesion), { replace: true })
      })
      .catch((fallo) => {
        setError(fallo.message)
        setEnviando(false)
      })
  }
  const campo = (etiqueta, nombre, tipo = 'text', placeholder = '') => (
    <CampoLinea etiqueta={etiqueta} nombre={nombre} tipo={tipo} valor={datos[nombre]}
      onChange={cambiar} placeholder={placeholder} requerido />
  )

  return (
    <LayoutAcceso
      foto={imagenes.salonArana}
      alt="Pista de Zenoir bajo la araña"
      titulo={<>Tu lugar<br />en la <span className="oro-texto">noche</span></>}
    >
      <h1 className="acceso__encabezado aparece">Crear cuenta</h1>
      <p className="acceso__bajada">Con tu cuenta reservás entradas y guardás tus QR.</p>
      <form className="acceso__form" onSubmit={enviar}>
        <div className="acceso__doble">
          {campo('NOMBRE', 'firstname', 'text', 'Sofia')}
          {campo('APELLIDO', 'lastname', 'text', 'Gomez')}
          {campo('DNI', 'dni', 'text', '40123456')}
          {campo('FECHA DE NACIMIENTO', 'fechaNacimiento', 'date')}
        </div>
        {campo('EMAIL', 'email', 'email', 'tu@email.com')}
        <CampoClave nombre="password" valor={datos.password} onChange={cambiar} placeholder="Elegí una contraseña"
          autoComplete="new-password" requerido />
        <FuerzaClave clave={datos.password} />
        <ReglasClave clave={datos.password} />
        {error && <p className="acceso__error" role="alert">{error}</p>}
        <Boton tipo="submit" deshabilitado={enviando} clase="boton--ancho boton--grande">
          {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
        </Boton>
      </form>
      <p className="acceso__pie">
        ¿Ya tenés cuenta? <Link to="/login" className="enlace-oro">Ingresá</Link>
      </p>
    </LayoutAcceso>
  )
}
