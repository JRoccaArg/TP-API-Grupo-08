import Boton from './Boton.jsx'
import EntradaEmitida from './EntradaEmitida.jsx'
import Icono from './Icono.jsx'
import PasosCompra from './PasosCompra.jsx'
import { entradasDeCompra } from '../utils/compras.js'
import { precio } from '../utils/formatos.js'

// La compra confirmada, con sus entradas emitidas. Solo muestra datos: "eventos" trae el evento de cada entrada, por id.
export default function CompraOk({ compra, eventos }) {
  const entradas = entradasDeCompra(compra)

  return (
    <main className="pagina compra">
      <PasosCompra paso={4} />
      <section className="compra-ok">
        <span className="compra-ok__check oro-relleno">
          <Icono nombre="tilde" tamano={40} grosor={2.6} />
        </span>
        <div>
          <h1 className="titulo-pagina aparece">
            Compra <span className="oro-texto">confirmada</span>
          </h1>
          <p>
            Pagaste <b>{precio(compra.total)}</b> · Compra N.º {compra.id} ·{' '}
            {entradas.length === 1 ? 'Emitimos tu entrada.' : `Emitimos tus ${entradas.length} entradas.`}
          </p>
        </div>
      </section>
      <section aria-label="Tus entradas" className="compra-ok__entradas">
        <p className="rotulo">TUS ENTRADAS</p>
        <ul className="emitidas">
          {entradas.map((entrada) => (
            <EntradaEmitida key={entrada.id} entrada={entrada} evento={eventos[entrada.eventoId]} />
          ))}
        </ul>
      </section>
      <div className="compra-ok__botones">
        <Boton to="/mis-entradas">Ver mis entradas</Boton>
        <Boton to="/" variante="contorno">
          Seguir comprando
        </Boton>
      </div>
      <p className="resumen__nota">Mostrá el QR de cada entrada en la puerta del evento.</p>
    </main>
  )
}
