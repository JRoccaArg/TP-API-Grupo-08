import { useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import TarjetaFlyer from './TarjetaFlyer.jsx'
import FiltrosEventos from './FiltrosEventos.jsx'
import PaginacionEventos from './PaginacionEventos.jsx'
import { leerFiltrosCatalogo } from '../utils/eventos.js'
import '../styles/catalogo.css'

const POR_PAGINA = 6

export default function SeccionFechas({ datos, categorias = [], cargando = false, error = '', errorCategorias = '', onReintentar }) {
  const eventos = datos.content
  const [parametros, setParametros] = useSearchParams()
  const { hash } = useLocation()
  const seccion = useRef(null)
  const resultados = useRef(null)
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(intervalo)
  }, [])
  useEffect(() => {
    if (!cargando && hash === '#fechas') seccion.current?.scrollIntoView({ block: 'start' })
  }, [cargando, hash])

  const filtros = leerFiltrosCatalogo(parametros)
  const { rangoInvalido, pagina } = filtros
  const paginas = Math.max(1, datos.totalPages)
  const inicio = (pagina - 1) * POR_PAGINA
  const total = datos.totalElements
  const hayFiltros = Boolean(filtros.busqueda || filtros.categoria || filtros.precioMin !== '' || filtros.precioMax !== '')
  const fallosOfertas = eventos.some((evento) => evento.errorOfertas)
  const fallosImagenes = eventos.some((evento) => evento.errorImagenes)


  function cambiarFiltro(nombre, valor) {
    const claves = { busqueda: 'q', categoria: 'categoria', precioMin: 'min', precioMax: 'max' }
    setParametros((actuales) => {
      const nuevos = new URLSearchParams(actuales)
      if (valor !== '') nuevos.set(claves[nombre], valor)
      else nuevos.delete(claves[nombre])
      nuevos.delete('pagina')
      return nuevos
    }, { replace: true })
  }

  function limpiarFiltros() {
    setParametros((actuales) => {
      const nuevos = new URLSearchParams(actuales)
      ;['q', 'categoria', 'min', 'max', 'pagina'].forEach((clave) => nuevos.delete(clave))
      return nuevos
    }, { replace: true })
  }

  function cambiarPagina(nuevaPagina) {
    setParametros((actuales) => {
      const nuevos = new URLSearchParams(actuales)
      if (nuevaPagina > 1) nuevos.set('pagina', String(nuevaPagina))
      else nuevos.delete('pagina')
      return nuevos
    }, { replace: true })
    resultados.current?.scrollIntoView({ block: 'start' })
  }

  return (
    <section ref={seccion} id="fechas" className="fechas catalogo-eventos" aria-labelledby="catalogo-titulo" aria-busy={cargando}>
      <div className="fechas__cabecera">
        <h2 id="catalogo-titulo" className="titulo-seccion">FECHAS DE ZENOIR</h2>
        <p>Elegí tu próxima noche y conocé todas las fechas de Zenoir.</p>
      </div>
      <div className="catalogo-eventos__contenido">
        <FiltrosEventos filtros={filtros} categorias={categorias} rangoInvalido={rangoInvalido} hayFiltros={hayFiltros} onCambiar={cambiarFiltro} onLimpiar={limpiarFiltros} />
        {errorCategorias && <div className="catalogo-eventos__aviso" role="status"><p>No pudimos cargar las categorías.</p><button type="button" onClick={onReintentar}>Reintentar</button></div>}

        {cargando ? (
          <div className="catalogo-eventos__estado" role="status">
            <span className="catalogo-eventos__pulso" aria-hidden="true" />
            <h3>Estamos preparando las fechas</h3>
            <p>Cargando eventos, imágenes y entradas disponibles…</p>
          </div>
        ) : error ? (
          <div className="catalogo-eventos__estado" role="alert">
            <h3>No pudimos cargar las fechas</h3>
            <p>Hubo un problema al consultar los eventos. Volvé a intentar en un momento.</p>
            {onReintentar && <button className="catalogo-eventos__boton" type="button" onClick={onReintentar}>Reintentar</button>}
          </div>
        ) : total === 0 && !hayFiltros ? (
          <div className="catalogo-eventos__estado" role="status">
            <h3>La próxima noche se está preparando</h3>
            <p>Todavía no hay eventos publicados. Volvé pronto para conocer las próximas fechas.</p>
            {onReintentar && <button className="catalogo-eventos__boton" type="button" onClick={onReintentar}>Actualizar fechas</button>}
          </div>
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
            <div ref={resultados} id="catalogo-resultados" className="catalogo-eventos__resultados" aria-live="polite" aria-atomic="true">
              {!rangoInvalido && <p><strong>{total}</strong> {total === 1 ? 'evento encontrado' : 'eventos encontrados'}{total > 0 && <span> · Mostrando {inicio + 1}–{Math.min(inicio + eventos.length, total)}</span>}</p>}
            </div>
            {rangoInvalido ? (
              <div className="catalogo-eventos__estado">
                <h3>Revisá el rango de precios</h3>
                <p>El precio mínimo tiene que ser menor o igual al máximo para buscar entradas.</p>
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
                  {eventos.map((evento, indice) => <TarjetaFlyer key={evento.id} evento={evento} ahora={ahora} indice={indice} />)}
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
