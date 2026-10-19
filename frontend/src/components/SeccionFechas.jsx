import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TarjetaFlyer from './TarjetaFlyer.jsx'
import EstadoCatalogo from './EstadoCatalogo.jsx'
import FiltrosEventos from './FiltrosEventos.jsx'
import OrdenEventos from './OrdenEventos.jsx'
import PaginacionEventos from './PaginacionEventos.jsx'
import { EVENTOS_POR_PAGINA } from '../utils/apiEventos.js'
import { conParametros, leerFiltrosCatalogo } from '../utils/eventos.js'
import '../styles/catalogo.css'

export default function SeccionFechas({ datos, categorias = [], cargando = false, error = '', errorCategorias = '', onReintentar }) {
  const eventos = datos.content
  const { hash, search } = useLocation()
  const navigate = useNavigate()
  const seccion = useRef(null)
  const resultados = useRef(null)
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(intervalo)
  }, [])
  // Al volver del detalle a "/#fechas" la página no baja sola: se lleva la sección a la vista cuando termina de cargar.
  useEffect(() => {
    if (!cargando && hash === '#fechas') seccion.current?.scrollIntoView({ block: 'start' })
  }, [cargando, hash])

  const filtros = leerFiltrosCatalogo(new URLSearchParams(search))
  const { errorPrecio, pagina } = filtros
  const paginas = Math.max(1, datos.totalPages)
  const inicio = (pagina - 1) * EVENTOS_POR_PAGINA
  const total = datos.totalElements
  const hayFiltros = Boolean(filtros.busqueda || filtros.categoria || filtros.precioMin !== '' || filtros.precioMax !== '')
  const fallosOfertas = eventos.some((evento) => evento.errorOfertas)
  const fallosImagenes = eventos.some((evento) => evento.errorImagenes)

  // Los filtros y la página viven en la URL: se cambian los parámetros y la pantalla se vuelve a armar sola.
  const irA = (cambios) => navigate({ search: conParametros(search, cambios) }, { replace: true })

  function cambiarFiltro(nombre, valor) {
    const claves = { busqueda: 'q', categoria: 'categoria', precioMin: 'min', precioMax: 'max', orden: 'orden' }
    irA({ [claves[nombre]]: valor === 'lejanos' ? '' : valor, pagina: '' })
  }

  function limpiarFiltros() {
    irA({ q: '', categoria: '', min: '', max: '', pagina: '' })
  }

  function cambiarPagina(nuevaPagina) {
    irA({ pagina: nuevaPagina > 1 ? String(nuevaPagina) : '' })
    resultados.current?.scrollIntoView({ block: 'start' })
  }

  return (
    <section ref={seccion} id="fechas" className="fechas catalogo-eventos" aria-labelledby="catalogo-titulo" aria-busy={cargando}>
      <div className="fechas__cabecera">
        <h2 id="catalogo-titulo" className="titulo-seccion">PRÓXIMAS FECHAS</h2>
        <p>Conseguí tus entradas para todas las fechas de Zenoir.</p>
      </div>
      <div className="catalogo-eventos__contenido">
        <FiltrosEventos filtros={filtros} categorias={categorias} errorPrecio={errorPrecio} hayFiltros={hayFiltros} onCambiar={cambiarFiltro} onLimpiar={limpiarFiltros} />
        {errorCategorias && <div className="catalogo-eventos__aviso" role="status"><p>No pudimos cargar las categorías.</p><button type="button" onClick={onReintentar}>Reintentar</button></div>}

        {cargando || error || (total === 0 && !hayFiltros) ? (
          <EstadoCatalogo cargando={cargando} error={error} onReintentar={onReintentar} />
        ) : (
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
              <div ref={resultados} id="catalogo-resultados" className="catalogo-eventos__resultados" aria-live="polite" aria-atomic="true">
                {!errorPrecio && <p><strong>{total}</strong> {total === 1 ? 'evento encontrado' : 'eventos encontrados'}{total > 0 && <span> · Mostrando {inicio + 1}–{Math.min(inicio + eventos.length, total)}</span>}</p>}
              </div>
              {!errorPrecio && total > 1 && <OrdenEventos orden={filtros.orden} onCambiar={(valor) => cambiarFiltro('orden', valor)} />}
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
                <button className="catalogo-eventos__boton" type="button" onClick={limpiarFiltros}>Limpiar filtros</button>
              </div>
            ) : (
              <>
                <div className="fechas__fila">
                  {eventos.map((evento, indice) => <TarjetaFlyer key={evento.id} evento={evento} ahora={ahora} indice={indice} filtroPrecio={filtros} />)}
                </div>
                <PaginacionEventos pagina={pagina} paginas={paginas} onCambiar={cambiarPagina} />
              </>
            )}
          </>
        )}
      </div>
    </section>
  )
}
