export default function FiltrosEventos({ filtros, categorias, rangoInvalido, hayFiltros, onCambiar, onLimpiar }) {
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
        <label htmlFor="eventos-minimo">
          <span>Precio mínimo ($)</span>
          <input id="eventos-minimo" type="number" min="0" step="0.01" inputMode="decimal" placeholder="Sin mínimo" value={filtros.precioMin} aria-invalid={rangoInvalido || undefined} aria-describedby={rangoInvalido ? 'eventos-error-precio eventos-ayuda-precio' : 'eventos-ayuda-precio'} onChange={(evento) => onCambiar('precioMin', evento.target.value)} />
        </label>
        <label htmlFor="eventos-maximo">
          <span>Precio máximo ($)</span>
          <input id="eventos-maximo" type="number" min="0" step="0.01" inputMode="decimal" placeholder="Sin máximo" value={filtros.precioMax} aria-invalid={rangoInvalido || undefined} aria-describedby={rangoInvalido ? 'eventos-error-precio eventos-ayuda-precio' : 'eventos-ayuda-precio'} onChange={(evento) => onCambiar('precioMax', evento.target.value)} />
        </label>
      </div>
      <div className="catalogo-filtros__pie">
        <p id="eventos-ayuda-precio">Filtrá por el precio final de una entrada actualmente en venta.</p>
        <button type="button" onClick={onLimpiar} disabled={!hayFiltros}>Limpiar filtros</button>
      </div>
      {rangoInvalido && <p id="eventos-error-precio" className="catalogo-filtros__error" role="alert">El mínimo no puede superar al máximo.</p>}
    </form>
  )
}
