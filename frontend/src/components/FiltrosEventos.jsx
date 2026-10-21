import RangoPrecios from './RangoPrecios.jsx'

export default function FiltrosEventos({ filtros, maximoPrecio, errorRango, categorias, errorPrecio, hayFiltros, onCambiar, onLimpiar }) {
  const categoriaConocida = !filtros.categoria || categorias.some((categoria) => categoria.id === filtros.categoria)

  return (
    <form className="catalogo-filtros" role="search" aria-label="Buscar eventos" onSubmit={(evento) => evento.preventDefault()}>
      <div className="catalogo-filtros__campos">
        <label className="catalogo-filtros__busqueda" htmlFor="eventos-busqueda">
          <span>Buscá por nombre</span>
          <input id="eventos-busqueda" type="search" placeholder="Nombre del evento" value={filtros.busqueda} onChange={(evento) => onCambiar('busqueda', evento.target.value)} />
        </label>
        <label htmlFor="eventos-categoria">
          <span>Categoría</span>
          <select id="eventos-categoria" value={filtros.categoria} onChange={(evento) => onCambiar('categoria', evento.target.value)}>
            <option value="">Todas las categorías</option>
            {!categoriaConocida && <option value={filtros.categoria}>Categoría no disponible</option>}
            {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
          </select>
        </label>
        <label htmlFor="eventos-estado">
          <span>Estado del evento</span>
          <select id="eventos-estado" value={filtros.estadoEvento || 'proximos'} onChange={(evento) => onCambiar('estadoEvento', evento.target.value)}>
            <option value="todos">Todos</option>
            <option value="proximos">Próximos</option>
            <option value="en-curso">En curso</option>
            <option value="finalizados">Finalizados</option>
            <option value="cancelados">Cancelados</option>
          </select>
        </label>
        <RangoPrecios filtros={filtros} maximoPrecio={maximoPrecio} errorRango={errorRango} errorPrecio={errorPrecio} onCambiar={onCambiar} />
      </div>
      <div className="catalogo-filtros__pie">
        <p id="eventos-ayuda-precio">El rango y el orden por precio usan entradas en venta, con descuentos incluidos. Los eventos sin precio disponible van al final.</p>
        <button type="button" onClick={onLimpiar} disabled={!hayFiltros}>Limpiar filtros</button>
      </div>
      {errorPrecio && <p id="eventos-error-precio" className="catalogo-filtros__error" role="alert">{errorPrecio}</p>}
    </form>
  )
}
