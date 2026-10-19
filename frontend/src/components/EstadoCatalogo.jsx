// Lo que se muestra en lugar de las tarjetas cuando no hay nada para mostrar: cargando, con error o sin eventos publicados.
export default function EstadoCatalogo({ cargando, error, onReintentar }) {
  if (cargando) {
    return (
      <div className="catalogo-eventos__estado" role="status">
        <span className="catalogo-eventos__pulso" aria-hidden="true" />
        <h3>Estamos preparando las fechas</h3>
        <p>Cargando eventos, imágenes y entradas disponibles…</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="catalogo-eventos__estado" role="alert">
        <h3>No pudimos cargar las fechas</h3>
        <p>Hubo un problema al consultar los eventos. Volvé a intentar en un momento.</p>
        {onReintentar && <button className="catalogo-eventos__boton" type="button" onClick={onReintentar}>Reintentar</button>}
      </div>
    )
  }
  return (
    <div className="catalogo-eventos__estado" role="status">
      <h3>La próxima noche se está preparando</h3>
      <p>Todavía no hay eventos publicados. Volvé pronto para conocer las próximas fechas.</p>
      {onReintentar && <button className="catalogo-eventos__boton" type="button" onClick={onReintentar}>Actualizar fechas</button>}
    </div>
  )
}
