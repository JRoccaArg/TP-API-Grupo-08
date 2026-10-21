import Boton from './Boton.jsx'

// Pantalla corta con mensaje y botón ("ingresá", "carrito vacío", "no existe"...). "state" viaja con el link (por ejemplo, a dónde volver al ingresar)
export default function Aviso({ mensaje, boton, to, state }) {
  return (
    <main className="pagina aviso">
      <h1 className="aviso__mensaje">{mensaje}</h1>
      <Boton to={to} state={state}>{boton}</Boton>
    </main>
  )
}
