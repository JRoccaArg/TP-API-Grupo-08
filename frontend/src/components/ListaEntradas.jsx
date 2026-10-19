import FilaEntrada from './FilaEntrada.jsx'

export default function ListaEntradas({ evento, seleccion, onCambiar, ahora }) {
  return (
    <section className="entradas">
      <div className="entradas__cabecera">
        <h2>Elegí tus entradas</h2>
      </div>
      <ul className="entradas__lista">
        {evento.ofertas.map((oferta) => (
          <FilaEntrada key={oferta.id} oferta={oferta} evento={evento} ahora={ahora}
            cantidad={seleccion.find((item) => item.ofertaId === oferta.id)?.cantidad || 0}
            onCambiar={onCambiar} />
        ))}
      </ul>
      {!evento.ofertas.length && <p className="catalogo-nota">Todavía no hay tipos de entrada publicados para este evento.</p>}
    </section>
  )
}
