import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Boton from '../components/Boton.jsx'
import CampoClave from '../components/CampoClave.jsx'
import CampoLinea from '../components/CampoLinea.jsx'
import LayoutAcceso from '../components/LayoutAcceso.jsx'
import { imagenes } from '../data/imagenes.js'
import { login } from '../redux/usuarioSlice'
import { destinoTrasIngresar } from '../utils/seleccionPendiente.js'

// Pantalla "/login": despacha el login y, cuando la sesión llega al store, lleva a donde corresponde.
export default function Login() {
  const dispatch = useDispatch()
  const { state } = useLocation() // "volverA": la pantalla de verificación que mandó a ingresar (solo la usa el ADMIN)
  const { sesion, loading, error } = useSelector((estado) => estado.usuario)
  const [datos, setDatos] = useState({ email: '', password: '' })
  const [enviado, setEnviado] = useState(false) // el error del store es de esta pantalla solo si ya se mandó el formulario

  const cambiar = (evento) => setDatos({ ...datos, [evento.target.name]: evento.target.value })
  const enviar = (evento) => {
    evento.preventDefault()
    setEnviado(true)
    dispatch(login(datos))
  }

  // Cuando llega la sesión la pantalla se redibuja y se va sola: no se espera al dispatch
  if (sesion) {
    return <Navigate to={sesion.rol === 'ADMIN' && state?.volverA ? state.volverA : destinoTrasIngresar(sesion)} replace />
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
        {enviado && error && <p className="acceso__error" role="alert">{error}</p>}
        <Boton tipo="submit" deshabilitado={loading} clase="boton--ancho boton--grande">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Boton>
      </form>
      <p className="acceso__pie">
        ¿No tenés cuenta? <Link to="/registro" className="enlace-oro">Creá una</Link>
      </p>
      <p className="acceso__nota">Podés ver todas las fechas sin cuenta. Para comprar necesitás ingresar.</p>
    </LayoutAcceso>
  )
}
