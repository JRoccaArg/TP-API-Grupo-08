import Hero from '../components/Hero.jsx'
import Cinta from '../components/Cinta.jsx'
import SeccionFechas from '../components/SeccionFechas.jsx'
import SeccionFotos from '../components/SeccionFotos.jsx'
import SeccionDonde from '../components/SeccionDonde.jsx'
import Sponsors from '../components/Sponsors.jsx'
import Footer from '../components/Footer.jsx'
import { eventos } from '../data/eventos.js'
import { cinta } from '../data/landing.js'

// Pantalla "/": solo ordena las secciones. Cada sección es un componente con una sola tarea.
export default function Inicio() {
  const proximo = eventos.find((evento) => evento.estado === 'ACTIVO')

  return (
    <>
      <Hero proximo={proximo} />
      <Cinta textos={cinta} />
      <SeccionFechas eventos={eventos} />
      <SeccionFotos />
      <SeccionDonde />
      <Sponsors />
      <Footer />
    </>
  )
}
