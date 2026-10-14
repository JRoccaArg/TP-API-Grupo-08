import FormEntrada from './FormEntrada.jsx'
import ResumenOferta from './ResumenOferta.jsx'

// Panel lateral con las entradas del evento. Si no recibe "ofertas" es porque el evento todavía no existe.
export default function PanelEntradas({ ofertas }) {
  return (
    <aside className="panel-entradas" aria-label="Entradas del evento">
      <h2>Entradas</h2>
      {ofertas ? (
        <>
          <ul className="panel-entradas__lista">
            {ofertas.map((oferta) => (
              <ResumenOferta key={oferta.id} oferta={oferta} />
            ))}
          </ul>
          <FormEntrada />
        </>
      ) : (
        <p className="panel-entradas__aviso">
          Primero guardá el evento. Después vas a poder agregar sus tipos de entrada, precios y fechas de venta.
        </p>
      )}
    </aside>
  )
}
