import Boton from './Boton.jsx'

// Franja que avisa que la sesión se cerró porque el back ya no la acepta (venció o el token dejó de servir).
// Queda a la vista hasta que la persona ingresa de nuevo.
export default function AvisoSesion() {
  return (
    <div className="aviso-sesion" role="status">
      <p>Tu sesión venció. Ingresá de nuevo para seguir.</p>
      <Boton to="/login" clase="boton--chico">Ingresar</Boton>
    </div>
  )
}
