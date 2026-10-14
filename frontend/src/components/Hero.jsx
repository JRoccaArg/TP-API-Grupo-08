import Boton from './Boton.jsx'
import Grano from './Grano.jsx'
import BarraProximaFecha from './BarraProximaFecha.jsx'
import { imagenes } from '../data/imagenes.js'

// Portada del inicio: foto del neón, titular, botón y la barra con la próxima fecha.
export default function Hero({ proximo }) {
  return (
    <div className="hero-marco">
      <section className="hero">
        <img className="hero__foto ken" src={imagenes.neon} alt="Cartel de neón de Zenoir" />
        <div className="hero__barrido" aria-hidden="true" />
        <div className="hero__sombra" aria-hidden="true" />
        <Grano />
        <div className="hero__texto">
          <h1 className="hero__titulo aparece">
            LA NOCHE MÁS
            <br />
            ELEGANTE
          </h1>
          <p className="hero__bajada aparece" style={{ animationDelay: '.25s' }}>
            Ediciones con barra libre en Recoleta. Elegí tu fecha, reservá y entrá con tu QR.
          </p>
          <Boton to={`/eventos/${proximo.id}`} clase="boton--grande aparece">
            Comprá tus entradas
          </Boton>
        </div>
        <BarraProximaFecha evento={proximo} />
      </section>
    </div>
  )
}
