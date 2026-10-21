import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import FiltrosEventos from './FiltrosEventos.jsx'
import ResultadosCatalogo from './ResultadosCatalogo.jsx'
import { conParametros, hayFiltros, leerFiltrosCatalogo } from '../utils/filtrosCatalogo.js'
import '../styles/catalogo.css'

export default function SeccionFechas({ datos, maximoPrecio, errorRango, categorias = [], cargando = false, error = '', errorCategorias = '', onReintentar }) {
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
    if (!cargando && hash === '#fechas') seccion.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [cargando, hash])

  const filtros = leerFiltrosCatalogo(new URLSearchParams(search))
  const { errorPrecio, pagina } = filtros
  const paginas = Math.max(1, datos.totalPages)
  const total = datos.totalElements

  // Los filtros y la página viven en la URL: se cambian los parámetros y la pantalla se vuelve a armar sola.
  const irA = (cambios) => navigate({ search: conParametros(search, cambios) }, { replace: true })

  function cambiarFiltro(nombre, valor) {
    const claves = { busqueda: 'q', categoria: 'categoria', precioMin: 'min', precioMax: 'max', orden: 'orden', estadoEvento: 'estado' }
    irA({ [claves[nombre]]: valor, pagina: '' })
  }

  function limpiarFiltros() {
    irA({ q: '', categoria: '', min: '', max: '', estado: '', periodo: '', fecha: '', orden: '', pagina: '' })
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
        <FiltrosEventos maximoPrecio={maximoPrecio} errorRango={errorRango} filtros={filtros} categorias={categorias} errorPrecio={errorPrecio} hayFiltros={hayFiltros(filtros)} onCambiar={cambiarFiltro} onLimpiar={limpiarFiltros} />
        {errorCategorias && <div className="catalogo-eventos__aviso" role="status"><p>No pudimos cargar las categorías.</p><button type="button" onClick={onReintentar}>Reintentar</button></div>}

        <ResultadosCatalogo
          eventos={eventos}
          filtros={filtros}
          total={total}
          pagina={pagina}
          paginas={paginas}
          ahora={ahora}
          cargando={cargando}
          error={error}
          referencia={resultados}
          onReintentar={onReintentar}
          onLimpiar={limpiarFiltros}
          onOrden={(valor) => cambiarFiltro('orden', valor)}
          onPagina={cambiarPagina}
        />
      </div>
    </section>
  )
}
