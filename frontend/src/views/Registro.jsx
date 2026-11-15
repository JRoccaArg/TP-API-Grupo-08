import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom'
import Boton from '../components/Boton.jsx'
import CampoClave from '../components/CampoClave.jsx'
import CampoLinea from '../components/CampoLinea.jsx'
import FuerzaClave from '../components/FuerzaClave.jsx'
import LayoutAcceso from '../components/LayoutAcceso.jsx'
import ReglasClave from '../components/ReglasClave.jsx'
import { imagenes } from '../data/imagenes.js'
import { registrar } from '../redux/usuarioSlice'
import { claveValida } from '../utils/clave.js'
import { validarRegistro } from '../utils/registro.js'
import { destinoTrasIngresar } from '../utils/seleccionPendiente.js'

const VACIO = { firstname: '', lastname: '', dni: '', fechaNacimiento: '', email: '', password: '' }

// Pantalla "/registro". Los nombres de los campos son los que pide el backend en /api/v1/auth/register.
// Al registrarse el backend ya devuelve el token: la persona queda con la sesión iniciada.
export default function Registro() {
  const dispatch = useDispatch()
  const { sesion, loading, error } = useSelector((state) => state.usuario)
  const [datos, setDatos] = useState(VACIO)
  const [aviso, setAviso] = useState('') // lo que falta completar, antes de mandar nada al back
  const [enviado, setEnviado] = useState(false) // el error del store es de esta pantalla solo si ya se mandó el formulario

  const cambiar = (evento) => setDatos({ ...datos, [evento.target.name]: evento.target.value })
  const enviar = (evento) => {
    evento.preventDefault()
    const problema = validarRegistro(datos)
    if (problema) {
      setAviso(problema)
      return
    }
    if (!claveValida(datos.password)) {
      setAviso('La contraseña todavía no cumple los requisitos.')
      return
    }
    setAviso('')
    setEnviado(true)
    dispatch(registrar(datos))
  }
  const campo = (etiqueta, nombre, tipo = 'text', placeholder = '') => (
    <CampoLinea etiqueta={etiqueta} nombre={nombre} tipo={tipo} valor={datos[nombre]}
      onChange={cambiar} placeholder={placeholder} requerido />
  )

  // Cuando llega la sesión la pantalla se redibuja y se va sola, igual que el login
  if (sesion) return <Navigate to={destinoTrasIngresar(sesion)} replace />
  const mensaje = aviso || (enviado ? error : null)

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
        {mensaje && <p className="acceso__error" role="alert">{mensaje}</p>}
        <Boton tipo="submit" deshabilitado={loading} clase="boton--ancho boton--grande">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Boton>
      </form>
      <p className="acceso__pie">
        ¿Ya tenés cuenta? <Link to="/login" className="enlace-oro">Ingresá</Link>
      </p>
    </LayoutAcceso>
  )
}
