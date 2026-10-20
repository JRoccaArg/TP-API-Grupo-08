import EstadoCatalogo from './EstadoCatalogo.jsx'
import OrdenEventos from './OrdenEventos.jsx'
import PaginacionEventos from './PaginacionEventos.jsx'
import TarjetaFlyer from './TarjetaFlyer.jsx'
import { EVENTOS_POR_PAGINA } from '../utils/apiEventos.js'
import { hayFiltros } from '../utils/filtrosCatalogo.js'

// Lo que va debajo de los filtros: el estado de la carga (cargando, error o sin eventos) o, con datos, el aviso de
// lo que no se pudo cargar, la cantidad encontrada, el orden, las tarjetas y la paginación.
// "referencia" es el div de resultados al que se baja al cambiar de página.
export default function ResultadosCatalogo({
  eventos, filtros, total, pagina, paginas, ahora, cargando, error, referencia, onReintentar, onLimpiar, onOrden, onPagina,
}) {
  const { errorPrecio } = filtros
  const inicio = (pagina - 1) * EVENTOS_POR_PAGINA
  const fallosOfertas = eventos.some((evento) => evento.errorOfertas)
  const fallosImagenes = eventos.some((evento) => evento.errorImagenes)

  if (cargando || error || (total === 0 && !hayFiltros(filtros))) {
    return <EstadoCatalogo cargando={cargando} error={error} onReintentar={onReintentar} />
  }
  return (
    <>
      {(fallosOfertas || fallosImagenes) && (
        <div className="catalogo-eventos__aviso" role="status">
          <p>{fallosOfertas && fallosImagenes
            ? 'No pudimos cargar algunas imágenes y entradas.'
            : fallosOfertas ? 'No pudimos confirmar las entradas de algunos eventos.' : 'No pudimos cargar algunas imágenes.'} Podés seguir explorando las fechas.{fallosOfertas && <span> Los precios y estados de esas tarjetas no pudieron confirmarse.</span>}</p>
          {onReintentar && <button type="button" onClick={onReintentar}>Volver a intentar</button>}
        </div>
      )}
      <div className="catalogo-eventos__barra">
        <div ref={referencia} id="catalogo-resultados" className="catalogo-eventos__resultados" aria-live="polite" aria-atomic="true">
          {!errorPrecio && <p><strong>{total}</strong> {total === 1 ? 'evento encontrado' : 'eventos encontrados'}{total > 0 && <span> · Mostrando {inicio + 1}–{Math.min(inicio + eventos.length, total)}</span>}</p>}
        </div>
        {!errorPrecio && total > 1 && <OrdenEventos orden={filtros.orden} onCambiar={onOrden} />}
      </div>
      {errorPrecio ? (
        <div className="catalogo-eventos__estado">
          <h3>Revisá el rango de precios</h3>
          <p>{errorPrecio}</p>
        </div>
      ) : total === 0 ? (
        <div className="catalogo-eventos__estado" role="status">
          <h3>No encontramos fechas con esos filtros</h3>
          <p>Probá otro nombre, elegí otra categoría o ampliá el rango de precios.</p>
          <button className="catalogo-eventos__boton" type="button" onClick={onLimpiar}>Limpiar filtros</button>
        </div>
      ) : (
        <>
          <div className="fechas__fila">
            {eventos.map((evento, indice) => <TarjetaFlyer key={evento.id} evento={evento} ahora={ahora} indice={indice} filtroPrecio={filtros} />)}
          </div>
          <PaginacionEventos pagina={pagina} paginas={paginas} onCambiar={onPagina} />
        </>
      )}
    </>
  )
}
