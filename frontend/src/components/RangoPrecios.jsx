import { precio } from '../utils/formatos.js'
import { normalizarImporteFiltro } from '../utils/filtrosCatalogo.js'

// Dos controles nativos comparten una sola pista; también se pueden mover con el teclado.
// El extremo superior sale del catálogo real y no de un tope fijo que deje entradas afuera.
export default function RangoPrecios({ filtros, maximoPrecio, errorRango, errorPrecio, onCambiar }) {
  const limite = Math.max(10000, Math.ceil((maximoPrecio || 0) / 10000) * 10000,
    Number(normalizarImporteFiltro(filtros.precioMin)) || 0, Number(normalizarImporteFiltro(filtros.precioMax)) || 0)
  const minimo = Math.max(0, Math.min(limite, Number(normalizarImporteFiltro(filtros.precioMin)) || 0))
  const maximo = filtros.precioMax === '' ? limite : Math.max(minimo, Math.min(limite, Number(normalizarImporteFiltro(filtros.precioMax)) || 0))
  const deshabilitado = maximoPrecio === null || Boolean(errorRango)
  const resumen = filtros.precioMin === '' && filtros.precioMax === '' ? 'Todos los precios' : `${precio(minimo)} – ${filtros.precioMax === '' ? 'Sin máximo' : precio(maximo)}`

  return (
    <fieldset className="catalogo-filtros__rango" disabled={deshabilitado} aria-describedby={errorPrecio ? 'eventos-error-precio eventos-ayuda-precio' : 'eventos-ayuda-precio'}>
      <legend>Rango de precios</legend>
      <output className="catalogo-rango__valor" aria-live="polite">{errorRango || (maximoPrecio === null ? 'Cargando precios…' : resumen)}</output>
      <div className="catalogo-rango" style={{ '--desde': `${minimo / limite * 100}%`, '--hasta': `${maximo / limite * 100}%` }}>
        <div className="catalogo-rango__pista" />
        <input id="eventos-minimo" className="catalogo-rango__control catalogo-rango__control--minimo" aria-label="Precio mínimo" aria-valuetext={precio(minimo)} type="range" min="0" max={limite} step="100" value={minimo} aria-invalid={Boolean(errorPrecio) || undefined} style={{ zIndex: minimo === limite ? 5 : 3 }} onChange={(evento) => {
          const valor = Math.min(Number(evento.target.value), maximo)
          onCambiar('precioMin', valor === 0 ? '' : String(valor))
        }} />
        <input id="eventos-maximo" className="catalogo-rango__control catalogo-rango__control--maximo" aria-label="Precio máximo" aria-valuetext={filtros.precioMax === '' ? 'Sin máximo' : precio(maximo)} type="range" min="0" max={limite} step="100" value={maximo} aria-invalid={Boolean(errorPrecio) || undefined} onChange={(evento) => {
          const valor = Math.max(Number(evento.target.value), minimo)
          onCambiar('precioMax', valor === limite ? '' : String(valor))
        }} />
      </div>
      <div className="catalogo-rango__extremos"><span>{precio(0)}</span><span>{precio(limite)}</span></div>
    </fieldset>
  )
}
