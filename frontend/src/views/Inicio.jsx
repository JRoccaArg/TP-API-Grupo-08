import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import Cinta from '../components/Cinta.jsx'
import SeccionFechas from '../components/SeccionFechas.jsx'
import SeccionFotos from '../components/SeccionFotos.jsx'
import SeccionDonde from '../components/SeccionDonde.jsx'
import Sponsors from '../components/Sponsors.jsx'
import Footer from '../components/Footer.jsx'
import { obtenerProximo, obtenerCatalogo, obtenerCategorias } from '../utils/apiEventos.js'
import { leerFiltrosCatalogo } from '../utils/eventos.js'
import { cinta } from '../data/landing.js'

export default function Inicio() {
  const [parametros, setParametros] = useSearchParams()
  const { busqueda, categoria, precioMin, precioMax, pagina, errorPrecio } = leerFiltrosCatalogo(parametros)
  const [consulta, setConsulta] = useState({ clave: '', datos: { content: [], totalElements: 0, totalPages: 0 }, error: '' })
  const [categorias, setCategorias] = useState([])
  const [errorCategorias, setErrorCategorias] = useState('')
  const [reintento, setReintento] = useState(0)
  const clave = JSON.stringify([busqueda, categoria, precioMin, precioMax, pagina, reintento])
  const cargando = !errorPrecio && consulta.clave !== clave
  const error = consulta.clave === clave ? consulta.error : ''
  const reintentar = () => setReintento((actual) => actual + 1)
  const [proximo, setProximo] = useState(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const control = new AbortController()
    obtenerProximo(control.signal).then((evento) => {
      if (!control.signal.aborted) setProximo(evento)
    }).catch(() => {
      if (!control.signal.aborted) setProximo(null)
    })
    return () => control.abort()
  }, [intento, reintento])

  useEffect(() => {
    if (!proximo) return
    const espera = Math.max(1, new Date(proximo.fechaHoraInicio).getTime() - Date.now() + 1)
    const reloj = setTimeout(() => setIntento((actual) => actual + 1), Math.min(espera, 2147483647))
    return () => clearTimeout(reloj)
  }, [proximo])

  useEffect(() => {
    const control = new AbortController()
    obtenerCategorias(control.signal).then((lista) => {
      if (!control.signal.aborted) { setCategorias(lista); setErrorCategorias('') }
    }).catch((fallo) => {
      if (!control.signal.aborted) setErrorCategorias(fallo.message)
    })
    return () => control.abort()
  }, [reintento])

  useEffect(() => {
    const control = new AbortController()
    if (errorPrecio) return () => control.abort()
    obtenerCatalogo(control.signal, { busqueda, categoria, precioMin, precioMax, pagina }).then((datos) => {
      if (control.signal.aborted) return
      const ultima = Math.max(1, datos.totalPages)
      if (pagina > ultima) {
        setParametros((actuales) => {
          const nuevos = new URLSearchParams(actuales)
          if (ultima > 1) nuevos.set('pagina', String(ultima))
          else nuevos.delete('pagina')
          return nuevos
        }, { replace: true })
      } else setConsulta({ clave, datos, error: '' })
    }).catch((fallo) => {
      if (!control.signal.aborted) setConsulta({ clave, datos: { content: [], totalElements: 0, totalPages: 0 }, error: fallo.message })
    })
    return () => control.abort()
  }, [busqueda, categoria, precioMin, precioMax, pagina, errorPrecio, clave, setParametros])

  return (
    <div className="inicio-catalogo">
      <Hero proximo={proximo || null} />
      <Cinta textos={cinta} />
      <SeccionFechas datos={consulta.datos} categorias={categorias} cargando={cargando} error={error} errorCategorias={errorCategorias} onReintentar={reintentar} />
      <SeccionFotos />
      <SeccionDonde />
      <Sponsors />
      <Footer />
    </div>
  )
}
