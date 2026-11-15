import FilaEntrada from './FilaEntrada.jsx'

// Las entradas del evento, cada una con su botón "Agregar". "enCarrito" dice cuántas de cada una ya están en el carrito
export default function ListaEntradas({ evento, ahora, enCarrito, agregando, errorAgregar, onAgregar }) {
  return (
    <section className="entradas">
      <div className="entradas__cabecera">
        <h2>Elegí tus entradas</h2>
      </div>
      <ul className="entradas__lista">
        {evento.ofertas.map((oferta) => (
          <FilaEntrada
            key={oferta.id}
            oferta={oferta}
            evento={evento}
            ahora={ahora}
            enCarrito={enCarrito[oferta.id] || 0}
            agregando={agregando === oferta.id}
            error={errorAgregar?.ofertaId === oferta.id ? errorAgregar.mensaje : ''}
            onAgregar={(cantidad) => onAgregar(oferta, cantidad)}
          />
        ))}
      </ul>
      {evento.ofertas.length > 0 ? (
        <p className="barra-compra__nota">
          Las entradas se reservan al agregarlas al carrito. Tenés 15 minutos desde la primera entrada que sumás, y ese tiempo es el mismo para todo el carrito.
        </p>
      ) : (
        <p className="catalogo-nota">Todavía no hay tipos de entrada publicados para este evento.</p>
      )}
    </section>
  )
}
