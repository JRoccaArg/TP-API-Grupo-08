import { Link } from 'react-router-dom'
import { fechaCorta, horario } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'

// Lo que se está por pagar, en modo lectura.
export default function ListaCompra({ lineas }) {
  return (
    <section className="lista-compra" aria-label="Tu compra">
      <div className="lista-compra__cabecera">
        <p className="rotulo">TU COMPRA</p>
        <Link to="/carrito" className="enlace-oro">
          Volver al carrito
        </Link>
      </div>
      <ul>
        {lineas.map(({ ofertaId, evento, oferta, cantidad, subtotal }) => (
          <li key={ofertaId}>
            <img src={evento.flyer} alt="" />
            <div>
              <h3>
                {evento.titulo} · {oferta.tipoEntradaNombre} × {cantidad}
              </h3>
              <p>
                {fechaCorta(evento.fechaHoraInicio)} · {horario(evento.fechaHoraInicio, evento.fechaHoraFin)} ·{' '}
                {evento.locacionNombre}
              </p>
            </div>
            <strong>{precio(subtotal)}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}
