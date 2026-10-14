import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Boton from '../components/Boton.jsx'
import CampoLinea from '../components/CampoLinea.jsx'
import LayoutAcceso from '../components/LayoutAcceso.jsx'
import { imagenes } from '../data/imagenes.js'

const VACIO = { firstname: '', lastname: '', dni: '', fechaNacimiento: '', email: '', password: '' }

// Pantalla "/registro". Los nombres de los campos son los que pide el backend en /api/v1/auth/register.
export default function Registro({ onIngresar }) {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(VACIO)

  const cambiar = (evento) => setDatos({ ...datos, [evento.target.name]: evento.target.value })
  const enviar = (evento) => {
    evento.preventDefault()
    onIngresar(datos.email, `${datos.firstname} ${datos.lastname}`)
    navigate('/')
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
        {campo('CONTRASEÑA', 'password', 'password', 'Elegí una contraseña')}
        <Boton tipo="submit" clase="boton--ancho boton--grande">Crear cuenta</Boton>
      </form>
      <p className="acceso__pie">
        ¿Ya tenés cuenta? <Link to="/login" className="enlace-oro">Ingresá</Link>
      </p>
    </LayoutAcceso>
  )
}
