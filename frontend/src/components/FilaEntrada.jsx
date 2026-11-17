import { useState } from 'react'
import Boton from './Boton.jsx'
import SelectorCantidad from './SelectorCantidad.jsx'
import { fechaCorta } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'
import { estadoOferta } from '../utils/eventos.js'

const AVISOS = {
  AGOTADO: 'Stock agotado.', PAUSADO: 'Venta pausada.', FINALIZADO: 'Venta finalizada.',
  CANCELADO: 'Evento cancelado.', REPROGRAMADO: 'Evento reprogramado.',
}

// El stock se carga una vez y no se vuelve a pedir, así que el número exacto podría quedar viejo: solo se avisa cuando quedan pocas.
// Si al agregar ya no alcanzan, el back lo rechaza con su mensaje.
const POCAS = 10

// Una entrada a la venta. Cada una tiene su botón "Agregar", porque el back agrega un tipo de entrada por pedido.
// La cantidad elegida es estado local; lo que ya está en el carrito (enCarrito) viene del store.
export default function FilaEntrada({ oferta, evento, ahora, enCarrito = 0, agregando = false, ocupado = false, error = '', onAgregar }) {
  const [cantidad, setCantidad] = useState(0)
  const estadoVenta = estadoOferta(oferta, evento, ahora)
  // Mientras se agrega cualquier entrada, ninguna fila deja agregar otra: el carrito recibe un pedido a la vez
  const bloqueado = agregando || ocupado
  const conPrecio = Number.isFinite(oferta.precioFinal)
  const conDescuento = oferta.porcentajeDescuento > 0 && Number.isFinite(oferta.precio)

  const agregar = () => {
    onAgregar(cantidad)
    setCantidad(0)
  }

  return (
    <li className={`fila-entrada ${cantidad > 0 || enCarrito > 0 ? 'fila-entrada--elegida' : ''} fila-entrada--${estadoVenta}`}>
      <div className="fila-entrada__datos">
        <h3>{oferta.tipoEntradaNombre}
          {conDescuento && <span className="fila-entrada__descuento oro-texto">−{oferta.porcentajeDescuento}%</span>}
        </h3>
        {oferta.tipoEntradaDescripcion && <p className="fila-entrada__descripcion">{oferta.tipoEntradaDescripcion}</p>}
        {estadoVenta !== 'EN_VENTA' && <p>Disponibilidad sujeta al estado de venta</p>}
        {estadoVenta === 'EN_VENTA' && oferta.cantidadDisponible <= POCAS && <p className="fila-entrada__ultimas oro-texto">¡Quedan las últimas!</p>}
        {enCarrito > 0 && <p className="fila-entrada__en-carrito oro-texto">Tenés {enCarrito} en tu carrito</p>}
        {error && <p className="fila-entrada__error" role="alert">{error}</p>}
      </div>
      <div className="fila-entrada__precio">
        {conDescuento && <s>{precio(oferta.precio)}</s>}
        <strong className={cantidad > 0 ? 'oro-texto' : ''}>{conPrecio ? precio(oferta.precioFinal) : 'Sin precio'}</strong>
      </div>
      {estadoVenta === 'EN_VENTA' ? (
        <div className="fila-entrada__comprar">
          <SelectorCantidad cantidad={cantidad} nombre={oferta.tipoEntradaNombre} maximo={oferta.cantidadDisponible}
            deshabilitado={bloqueado} onCambiar={setCantidad} />
          <Boton clase="boton--chico" deshabilitado={cantidad === 0 || bloqueado} onClick={agregar}>
            {agregando ? 'Agregando…' : 'Agregar'}
          </Boton>
        </div>
      ) : (
        <p className="fila-entrada__aviso">{estadoVenta === 'PROXIMAMENTE'
          ? `Venta desde ${fechaCorta(oferta.fechaInicioVenta)}` : AVISOS[estadoVenta] || 'Venta no disponible.'}</p>
      )}
    </li>
  )
}
