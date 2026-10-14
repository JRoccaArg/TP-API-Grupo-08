import { iniciales } from '../utils/formatos.js'

// Bloques informativos del pago: quién compra y cómo se paga.
export default function DatosPago({ usuario }) {
  return (
    <>
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
      <section className="bloque-pago" aria-label="Método de pago">
        <p className="rotulo">MÉTODO DE PAGO</p>
        <div className="metodo">
          <span className="metodo__punto oro-relleno" aria-hidden="true" />
          <div>
            <strong>Pago de demostración</strong>
            <p>Este entorno no realiza cobros reales: al confirmar se emiten tus entradas.</p>
          </div>
        </div>
      </section>
    </>
  )
}
