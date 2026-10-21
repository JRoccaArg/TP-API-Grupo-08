import Boton from './Boton.jsx'
import { totalSeleccion } from '../utils/eventos.js'
import { precio } from '../utils/formatos.js'

// La selección es local. Sólo un callback de integración real puede continuar la operación.
export default function BarraCompra({ seleccion, ofertas, onConfirmar, conectado, enviando }) {
  const cantidad = seleccion.reduce((total, item) => total + item.cantidad, 0)
  return (
    <>
      <div className="barra-compra">
        <div aria-live="polite">
          <p className="barra-compra__rotulo">{cantidad === 1 ? '1 ENTRADA' : `${cantidad} ENTRADAS`}</p>
          <strong className="barra-compra__total oro-texto">{precio(totalSeleccion(seleccion, ofertas))}</strong>
        </div>
        <Boton onClick={onConfirmar} deshabilitado={!conectado || cantidad === 0 || enviando} clase="boton--grande">
          {enviando ? 'Verificando…' : conectado ? 'Agregar al carrito' : 'Compra no disponible'}
        </Boton>
      </div>
      <p className="barra-compra__nota">
        {conectado
          ? 'Las entradas se reservan al agregarlas al carrito. Tenés 15 minutos desde la primera entrada que sumás, y ese tiempo es el mismo para todo el carrito.'
          : 'Seleccionar entradas no reserva stock. La compra todavía no está habilitada.'}
      </p>
    </>
  )
}
