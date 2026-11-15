import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Hero from '../components/Hero.jsx'
import Cinta from '../components/Cinta.jsx'
import SeccionFechas from '../components/SeccionFechas.jsx'
import SeccionFotos from '../components/SeccionFotos.jsx'
import SeccionDonde from '../components/SeccionDonde.jsx'
import Sponsors from '../components/Sponsors.jsx'
import Footer from '../components/Footer.jsx'
import { obtenerProximos } from '../redux/eventosSlice'
import { esperaProximaFecha } from '../utils/fechas.js'

export default function Inicio() {
  const dispatch = useDispatch()
  const { proximos, paginas, loading, error } = useSelector((state) => state.eventos)
  const proximo = proximos?.[0] || null
  // Las secciones de abajo bajan solas a su ancla recién cuando el catálogo terminó de cargar
  const listo = (paginas.length > 0 || Boolean(error)) && !loading

  // null es que todavía no se pidieron
  useEffect(() => {
    if (proximos === null) dispatch(obtenerProximos())
  }, [dispatch, proximos])

  // Cuando empieza la próxima fecha se piden de nuevo, para mostrar la siguiente
  useEffect(() => {
    if (!proximo) return undefined
    const reloj = setTimeout(() => dispatch(obtenerProximos()), esperaProximaFecha(proximo.fechaHoraInicio))
    return () => clearTimeout(reloj)
  }, [dispatch, proximo])

  return (
    <div className="inicio-catalogo">
      <Hero proximo={proximo} />
      <Cinta eventos={proximos || []} />
      <SeccionFechas />
      <SeccionFotos listo={listo} />
      <SeccionDonde listo={listo} />
      <Sponsors />
      <Footer />
    </div>
  )
}
