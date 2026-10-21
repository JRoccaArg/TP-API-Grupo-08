import Boton from './Boton.jsx'

// Aviso de que la sesión se cerró porque el back ya no la acepta (venció o el token dejó de servir). Queda hasta que se vuelve a ingresar
export default function AvisoSesion() {
  return (
    <div className="aviso-sesion" role="status">
      <p>Tu sesión venció. Ingresá de nuevo para seguir.</p>
      <Boton to="/login" clase="boton--chico">Ingresar</Boton>
    </div>
  )
}
