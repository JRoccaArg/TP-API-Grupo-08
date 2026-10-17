export default function PaginacionEventos({ pagina, paginas, onCambiar }) {
  if (paginas <= 1) return null

  return (
    <nav className="catalogo-paginacion" aria-label="Páginas de eventos">
      <button type="button" disabled={pagina === 1} onClick={() => onCambiar(pagina - 1)}>← Anterior</button>
      <span aria-live="polite">Página <strong>{pagina}</strong> de {paginas}</span>
      <button type="button" disabled={pagina === paginas} onClick={() => onCambiar(pagina + 1)}>Siguiente →</button>
    </nav>
  )
}
