import Boton from './Boton.jsx'

// Pantalla corta con un mensaje y un botón: sirve para "ingresá", "carrito vacío", "no existe", etc.
// "state" (opcional) viaja con el link: por ejemplo, a dónde volver después de ingresar.
export default function Aviso({ mensaje, boton, to, state }) {
  return (
    <main className="pagina aviso">
      <h1 className="aviso__mensaje">{mensaje}</h1>
      <Boton to={to} state={state}>{boton}</Boton>
    </main>
  )
}
