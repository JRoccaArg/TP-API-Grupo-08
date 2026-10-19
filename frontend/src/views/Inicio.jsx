import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import Cinta from '../components/Cinta.jsx'
import SeccionFechas from '../components/SeccionFechas.jsx'
import SeccionFotos from '../components/SeccionFotos.jsx'
import SeccionDonde from '../components/SeccionDonde.jsx'
import Sponsors from '../components/Sponsors.jsx'
import Footer from '../components/Footer.jsx'
import { obtenerProximos, obtenerCatalogo, obtenerCategorias } from '../utils/apiEventos.js'
import { conParametros, leerFiltrosCatalogo } from '../utils/eventos.js'
import { esperaProximaFecha } from '../utils/fechas.js'

export default function Inicio() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const { busqueda, categoria, precioMin, precioMax, orden, pagina, errorPrecio } = leerFiltrosCatalogo(new URLSearchParams(search))
  const [consulta, setConsulta] = useState({ clave: '', datos: { content: [], totalElements: 0, totalPages: 0 }, error: '' })
  const [categorias, setCategorias] = useState([])
  const [errorCategorias, setErrorCategorias] = useState('')
  const [reintento, setReintento] = useState(0)
  const clave = JSON.stringify([busqueda, categoria, precioMin, precioMax, orden, pagina, reintento])
  const cargando = !errorPrecio && consulta.clave !== clave
  const error = consulta.clave === clave ? consulta.error : ''
  const reintentar = () => setReintento((actual) => actual + 1)
  const [proximos, setProximos] = useState([])
  const proximo = proximos[0] || null
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let activo = true
    obtenerProximos().then((lista) => {
      if (activo) setProximos(lista)
    }).catch(() => {
      if (activo) setProximos([])
    })
    return () => { activo = false }
  }, [intento, reintento])

  useEffect(() => {
    if (!proximo) return undefined
    const espera = esperaProximaFecha(proximo.fechaHoraInicio)
    const reloj = setTimeout(() => setIntento((actual) => actual + 1), espera)
    return () => clearTimeout(reloj)
  }, [proximo])

  useEffect(() => {
    let activo = true
    obtenerCategorias().then((lista) => {
      if (activo) { setCategorias(lista); setErrorCategorias('') }
    }).catch((fallo) => {
      if (activo) setErrorCategorias(fallo.message)
    })
    return () => { activo = false }
  }, [reintento])

  useEffect(() => {
    if (errorPrecio) return undefined
    let activo = true
    obtenerCatalogo({ busqueda, categoria, precioMin, precioMax, orden, pagina }).then((datos) => {
      if (!activo) return
      const ultima = Math.max(1, datos.totalPages)
      // Si la página pedida ya no existe (por ejemplo, tras un filtro), se pasa a la última que haya.
      if (pagina > ultima) navigate({ search: conParametros(search, { pagina: ultima > 1 ? String(ultima) : '' }) }, { replace: true })
      else setConsulta({ clave, datos, error: '' })
    }).catch((fallo) => {
      if (activo) setConsulta({ clave, datos: { content: [], totalElements: 0, totalPages: 0 }, error: fallo.message })
    })
    return () => { activo = false }
  }, [busqueda, categoria, precioMin, precioMax, orden, pagina, errorPrecio, clave, search, navigate])

  return (
    <div className="inicio-catalogo">
      <Hero proximo={proximo || null} />
      <Cinta textos={['Zenoir', ...proximos.map((evento) => evento.titulo)]} />
      <SeccionFechas datos={consulta.datos} categorias={categorias} cargando={cargando} error={error} errorCategorias={errorCategorias} onReintentar={reintentar} />
      <SeccionFotos />
      <SeccionDonde />
      <Sponsors />
      <Footer />
    </div>
  )
}
