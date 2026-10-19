import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import EntradaEmitida from '../components/EntradaEmitida.jsx'
import Icono from '../components/Icono.jsx'
import PasosCompra from '../components/PasosCompra.jsx'
import { eventos } from '../data/eventos.js'
import { precio } from '../utils/formatos.js'

// Pantalla "/compra-confirmada": lo que se acaba de comprar, con sus entradas emitidas.
export default function CompraConfirmada({ usuario, compra }) {
  if (usuario?.rol !== 'USER') {
    return <Aviso mensaje="Ingresá para ver tu compra." boton="Ingresar" to="/login" />
  }
  if (!compra) return <Aviso mensaje="No hay una compra reciente." boton="Ver mis entradas" to="/mis-entradas" />

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
            Pagaste <b>{precio(compra.total)}</b> · Compra N.º {compra.numero} · Emitimos tus{' '}
            {compra.entradas.length} entradas.
          </p>
        </div>
      </section>
      <section aria-label="Tus entradas" className="compra-ok__entradas">
        <p className="rotulo">TUS ENTRADAS</p>
        <ul className="emitidas">
          {compra.entradas.map((entrada) => (
            <EntradaEmitida
              key={entrada.id}
              entrada={entrada}
              evento={eventos.find((evento) => evento.id === entrada.eventoId)}
            />
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
