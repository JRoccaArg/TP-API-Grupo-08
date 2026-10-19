import Icono from './Icono.jsx'

// Logo de la marca que se detecta por el número. Mientras no se sabe cuál es, un ícono genérico.
export default function MarcaTarjeta({ marca }) {
  if (marca === 'visa') return <span className="marca-tarjeta marca-tarjeta--visa">VISA</span>
  if (marca === 'amex') return <span className="marca-tarjeta marca-tarjeta--amex">AMEX</span>
  if (marca === 'mastercard') {
    return (
      <span className="marca-tarjeta marca-tarjeta--mastercard" role="img" aria-label="Mastercard">
        <span />
        <span />
      </span>
    )
  }
  return (
    <span className="marca-tarjeta">
      <Icono nombre="ondas" tamano={30} />
    </span>
  )
}
