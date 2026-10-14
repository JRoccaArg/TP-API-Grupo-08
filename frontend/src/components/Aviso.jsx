import Boton from './Boton.jsx'

// Pantalla corta con un mensaje y un botón: sirve para "ingresá", "carrito vacío", "no existe", etc.
export default function Aviso({ mensaje, boton, to }) {
  return (
    <main className="pagina aviso">
      <h1 className="aviso__mensaje">{mensaje}</h1>
      <Boton to={to}>{boton}</Boton>
    </main>
  )
}
