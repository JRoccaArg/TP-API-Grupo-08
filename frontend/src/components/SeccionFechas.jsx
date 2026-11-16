import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import FiltrosEventos from './FiltrosEventos.jsx'
import ResultadosCatalogo from './ResultadosCatalogo.jsx'
import { obtenerCategorias } from '../redux/categoriasSlice'
import { obtenerCatalogo, obtenerImagenes, obtenerOfertas, obtenerRangoPrecios, seleccionarConsultaCatalogo } from '../redux/eventosSlice'
import { conParametros, consultaCatalogo, hayFiltros, leerFiltrosCatalogo } from '../utils/filtrosCatalogo.js'
import '../styles/catalogo.css'

export default function SeccionFechas() {
  const { hash, search } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const seccion = useRef(null)
  const resultados = useRef(null)
  const [ahora, setAhora] = useState(() => Date.now())
  const { items, paginas, rangoPrecios, errorRango } = useSelector((state) => state.eventos)
  const { items: categorias, error: errorCategorias, cargado: categoriasCargadas } = useSelector((state) => state.categorias)

  const filtros = leerFiltrosCatalogo(new URLSearchParams(search))
  const { errorPrecio, pagina } = filtros
  const consulta = consultaCatalogo(filtros)
  const { error } = useSelector((state) => seleccionarConsultaCatalogo(state, consulta))
  // La página que se está mirando, si ya se pidió antes (se busca por su consulta)
  const actual = paginas.find((guardada) => guardada.consulta === consulta)
  const eventos = actual ? actual.ids.map((id) => items.find((evento) => evento.id === id)) : []
  const cargando = !errorPrecio && !actual && !error
  const categoriasOrdenadas = [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  // El error de categorías también puede venir del admin (por ejemplo, un nombre repetido): acá importa solo si no se cargaron
  const fallaronCategorias = Boolean(errorCategorias) && !categoriasCargadas

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(intervalo)
  }, [])

  // Lo que ya está en el store no se vuelve a pedir
  useEffect(() => {
    if (!categoriasCargadas) dispatch(obtenerCategorias())
  }, [dispatch, categoriasCargadas])

  useEffect(() => {
    if (rangoPrecios === null) dispatch(obtenerRangoPrecios())
  }, [dispatch, rangoPrecios])

  // Se espera un momento antes de pedir, así no sale un pedido por cada letra que se escribe en la búsqueda
  useEffect(() => {
    if (errorPrecio || actual) return undefined
    const espera = setTimeout(() => dispatch(obtenerCatalogo(consulta)), 180)
    return () => clearTimeout(espera)
  }, [dispatch, errorPrecio, actual, consulta])

  // Al volver del detalle a "/#fechas" la página no baja sola: se lleva la sección a la vista cuando termina de cargar.
  useEffect(() => {
    if (!cargando && hash === '#fechas') seccion.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [cargando, hash])

  // Se vuelve a pedir solo lo que falló
  function reintentar() {
    if (fallaronCategorias) dispatch(obtenerCategorias())
    if (errorRango) dispatch(obtenerRangoPrecios())
    if (error) dispatch(obtenerCatalogo(consulta))
    eventos.forEach((evento) => {
      if (evento.errorOfertas) dispatch(obtenerOfertas({ eventoId: evento.id }))
      if (evento.errorImagenes) dispatch(obtenerImagenes({ eventoId: evento.id }))
    })
  }

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
        <FiltrosEventos maximoPrecio={rangoPrecios} errorRango={errorRango ? 'No pudimos cargar el rango de precios.' : ''} filtros={filtros} categorias={categoriasOrdenadas} errorPrecio={errorPrecio} hayFiltros={hayFiltros(filtros)} onCambiar={cambiarFiltro} onLimpiar={limpiarFiltros} />
        {fallaronCategorias && <div className="catalogo-eventos__aviso" role="status"><p>No pudimos cargar las categorías.</p><button type="button" onClick={reintentar}>Reintentar</button></div>}

        <ResultadosCatalogo
          eventos={eventos}
          filtros={filtros}
          total={actual ? actual.total : 0}
          pagina={pagina}
          paginas={Math.max(1, actual ? actual.totalPaginas : 0)}
          ahora={ahora}
          cargando={cargando}
          error={error}
          referencia={resultados}
          onReintentar={reintentar}
          onLimpiar={limpiarFiltros}
          onOrden={(valor) => cambiarFiltro('orden', valor)}
          onPagina={cambiarPagina}
        />
      </div>
    </section>
  )
}
