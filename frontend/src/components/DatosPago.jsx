import { iniciales } from '../utils/formatos.js'

// Quién compra. El método de pago (la tarjeta) vive en PagoTarjeta.
export default function DatosPago({ usuario }) {
  return (
    <section className="bloque-pago" aria-label="Comprador">
      <p className="rotulo">COMPRADOR</p>
      <div className="comprador">
        <span className="cuenta__avatar">{iniciales(usuario.nombre)}</span>
        <div>
          <strong>{usuario.nombre}</strong>
          <p>Las entradas se emiten a nombre de tu cuenta.</p>
        </div>
      </div>
    </section>
  )
}
