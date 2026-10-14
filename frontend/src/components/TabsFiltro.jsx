// Pestañas de texto para filtrar la lista. Cada filtro trae su propia función "coincide".
export default function TabsFiltro({ filtros, eventos, activo, onElegir }) {
  return (
    <div className="tabs" role="tablist" aria-label="Filtrar eventos">
      {filtros.map((filtro) => {
        const elegido = activo === filtro.id
        return (
          <button
            key={filtro.id}
            type="button"
            role="tab"
            aria-selected={elegido}
            className={`tabs__tab ${elegido ? 'tabs__tab--activa oro-texto' : ''}`}
            onClick={() => onElegir(filtro.id)}
          >
            {filtro.texto} · {eventos.filter(filtro.coincide).length}
          </button>
        )
      })}
    </div>
  )
}
