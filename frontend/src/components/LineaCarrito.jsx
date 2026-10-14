import SelectorCantidad from './SelectorCantidad.jsx'
import { fechaCorta, horario } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'

// Una entrada dentro del carrito: flyer, datos, cantidad, subtotal y botón para quitarla.
export default function LineaCarrito({ linea, onCambiar }) {
  const { oferta, evento, cantidad, subtotal } = linea
  const { fechaHoraInicio: inicio, fechaHoraFin: fin } = evento

  return (
    <li className="linea">
      <img src={evento.flyer} alt="" />
      <div className="linea__datos">
        <h3>
          {evento.titulo}
          <span className="linea__tipo">{oferta.tipoEntradaNombre.toUpperCase()}</span>
        </h3>
        <p>
          {fechaCorta(inicio)} · {horario(inicio, fin)} · {evento.locacionNombre}
        </p>
        <p className="linea__unidad">
          {oferta.porcentajeDescuento > 0 && <s>{precio(oferta.precio)}</s>} <b>{precio(oferta.precioFinal)}</b> c/u
        </p>
      </div>
      <SelectorCantidad
        cantidad={cantidad}
        nombre={oferta.tipoEntradaNombre}
        onCambiar={(nueva) => onCambiar(oferta.id, nueva)}
      />
      <strong className="linea__subtotal">{precio(subtotal)}</strong>
      <button type="button" className="linea__quitar" onClick={() => onCambiar(oferta.id, 0)}>
        Quitar
      </button>
    </li>
  )
}
