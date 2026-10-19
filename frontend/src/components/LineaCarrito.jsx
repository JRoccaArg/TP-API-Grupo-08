import SelectorCantidad from './SelectorCantidad.jsx'
import { fechaCorta, horario } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'

// Una entrada dentro del carrito: flyer, datos, cantidad, subtotal y botón para quitarla.
// "evento" (flyer, fecha y lugar) se pide aparte y puede faltar: la línea se muestra igual con lo que trae el carrito.
// No llama al backend: avisa la nueva cantidad con onCambiar (con 0 se quita) y quien la usa se ocupa.
export default function LineaCarrito({ item, evento, ocupado, onCambiar }) {
  const portada = evento?.imagenes?.[0]

  return (
    <li className="linea">
      {portada ? <img src={portada.url} alt="" /> : <span className="linea__sin-foto" aria-hidden="true" />}
      <div className="linea__datos">
        <h3>
          {item.eventoTitulo}
          <span className="linea__tipo">{item.tipoEntradaNombre.toUpperCase()}</span>
        </h3>
        {evento && (
          <p>
            {fechaCorta(evento.fechaHoraInicio)} · {horario(evento.fechaHoraInicio, evento.fechaHoraFin)} · {evento.locacionNombre}
          </p>
        )}
        <p className="linea__unidad">
          {item.porcentajeDescuento > 0 && <s>{precio(item.precioOriginal)}</s>} <b>{precio(item.precioUnitario)}</b> c/u
        </p>
      </div>
      <SelectorCantidad cantidad={item.cantidad} nombre={item.tipoEntradaNombre} maximo={99} deshabilitado={ocupado} onCambiar={onCambiar} />
      <strong className="linea__subtotal">{precio(item.subtotal)}</strong>
      <button type="button" className="linea__quitar" disabled={ocupado} onClick={() => onCambiar(0)}>
        Quitar
      </button>
    </li>
  )
}
