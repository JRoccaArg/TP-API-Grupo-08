import { useEffect, useState } from 'react'
import Hero from '../components/Hero.jsx'
import Cinta from '../components/Cinta.jsx'
import SeccionFechas from '../components/SeccionFechas.jsx'
import SeccionFotos from '../components/SeccionFotos.jsx'
import SeccionDonde from '../components/SeccionDonde.jsx'
import Sponsors from '../components/Sponsors.jsx'
import Footer from '../components/Footer.jsx'
import { obtenerCatalogo } from '../utils/apiEventos.js'
import { cinta } from '../data/landing.js'

export default function Inicio() {
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [ahora, setAhora] = useState(Date.now)

  useEffect(() => {
    const control = new AbortController()
    obtenerCatalogo(control.signal).then((datos) => {
      if (!control.signal.aborted) { setEventos(datos); setAhora(Date.now()) }
    }).catch((fallo) => {
      if (!control.signal.aborted) { setEventos([]); setError(fallo.message) }
    }).finally(() => {
      if (!control.signal.aborted) setCargando(false)
    })
    return () => control.abort()
  }, [intento])

  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(reloj)
  }, [])

  const proximos = eventos.filter((evento) =>
    evento.estado?.toUpperCase() === 'ACTIVO' && new Date(evento.fechaHoraInicio).getTime() >= ahora)
  const proximo = !cargando && !error && proximos.sort((a, b) =>
    a.fechaHoraInicio.localeCompare(b.fechaHoraInicio) || a.id - b.id)[0]

  const reintentar = () => { setCargando(true); setError(''); setIntento(intento + 1) }

  return (
    <div className="inicio-catalogo">
      <Hero proximo={proximo || null} />
      <Cinta textos={cinta} />
      <SeccionFechas eventos={eventos} cargando={cargando} error={error} onReintentar={reintentar} />
      <SeccionFotos />
      <SeccionDonde />
      <Sponsors />
      <Footer />
    </div>
  )
}
