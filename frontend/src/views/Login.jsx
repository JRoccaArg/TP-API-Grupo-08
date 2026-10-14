import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Boton from '../components/Boton.jsx'
import CampoLinea from '../components/CampoLinea.jsx'
import LayoutAcceso from '../components/LayoutAcceso.jsx'
import { imagenes } from '../data/imagenes.js'

// Pantalla "/login". La sesión es de mentira: App crea el usuario con el email que se escribe.
export default function Login({ onIngresar }) {
  const navigate = useNavigate()
  const [datos, setDatos] = useState({ email: '', password: '' })
  const [verClave, setVerClave] = useState(false)

  const cambiar = (evento) => setDatos({ ...datos, [evento.target.name]: evento.target.value })
  const enviar = (evento) => {
    evento.preventDefault()
    const usuario = onIngresar(datos.email)
    navigate(usuario.rol === 'ADMIN' ? '/admin' : '/')
  }
  const botonMostrar = (
    <button type="button" className="campo__accion" onClick={() => setVerClave(!verClave)}>
      {verClave ? 'Ocultar' : 'Mostrar'}
    </button>
  )

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
          onChange={cambiar} placeholder="tu@email.com" requerido />
        <CampoLinea etiqueta="CONTRASEÑA" nombre="password" tipo={verClave ? 'text' : 'password'}
          valor={datos.password} onChange={cambiar} placeholder="Tu contraseña" requerido extra={botonMostrar} />
        <Boton tipo="submit" clase="boton--ancho boton--grande">Ingresar</Boton>
      </form>
      <p className="acceso__pie">
        ¿No tenés cuenta? <Link to="/registro" className="enlace-oro">Creá una</Link>
      </p>
      <p className="acceso__nota">Podés ver todas las fechas sin cuenta. Para comprar necesitás ingresar.</p>
    </LayoutAcceso>
  )
}
