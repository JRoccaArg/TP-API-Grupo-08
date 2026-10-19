import MarcaTarjeta from './MarcaTarjeta.jsx'
import { detectarMarca, formatearVencimiento, numeroVisual } from '../utils/tarjeta.js'

// Tarjeta dibujada con lo que se va escribiendo. "foco" es el campo que se está editando:
// ese dato se subraya y, si es el CVV, la tarjeta gira para mostrar el dorso.
export default function TarjetaVisual({ tarjeta, foco }) {
  const marca = detectarMarca(tarjeta.numero)
  const subrayar = (campo) => `tarjeta-visual__dato ${foco === campo ? 'tarjeta-visual__dato--activo' : ''}`

  return (
    <div className="tarjeta-visual" aria-hidden="true">
      <div className={`tarjeta-visual__giro ${foco === 'cvv' ? 'tarjeta-visual__giro--girada' : ''}`}>
        <div className="tarjeta-visual__cara tarjeta-visual__frente">
          <div className="tarjeta-visual__fila">
            <span className="tarjeta-visual__logo">ZENOIR</span>
            <MarcaTarjeta marca={marca} />
          </div>
          <span className="tarjeta-visual__chip" />
          <p className={`tarjeta-visual__numero ${subrayar('numero')}`}>{numeroVisual(tarjeta.numero, marca)}</p>
          <div className="tarjeta-visual__fila">
            <div className={`tarjeta-visual__titular ${subrayar('nombre')}`}>
              <span className="tarjeta-visual__rotulo">TITULAR</span>
              <span>{tarjeta.nombre.trim() ? tarjeta.nombre.toUpperCase() : 'NOMBRE APELLIDO'}</span>
            </div>
            <div className={subrayar('vencimiento')}>
              <span className="tarjeta-visual__rotulo">VENCE</span>
              <span>{tarjeta.vencimiento ? formatearVencimiento(tarjeta.vencimiento) : 'MM/AA'}</span>
            </div>
          </div>
        </div>
        <div className="tarjeta-visual__cara tarjeta-visual__dorso">
          <div className="tarjeta-visual__banda" />
          <span className="tarjeta-visual__rotulo tarjeta-visual__rotulo--der">CVV</span>
          <div className="tarjeta-visual__firma">
            <span className="tarjeta-visual__rayas" />
            <span className="tarjeta-visual__cvv">{tarjeta.cvv ? '•'.repeat(tarjeta.cvv.length) : '•••'}</span>
          </div>
          <p className="tarjeta-visual__aviso">Pago de demostración. Esta tarjeta no se cobra ni se guarda.</p>
        </div>
      </div>
    </div>
  )
}
