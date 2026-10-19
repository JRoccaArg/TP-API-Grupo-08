import { useLocation } from 'react-router-dom'
import Boton from './Boton.jsx'
import Grano from './Grano.jsx'
import BarraProximaFecha from './BarraProximaFecha.jsx'
import { imagenes } from '../data/imagenes.js'

// La portada conserva sus imágenes y funciona aunque todavía no haya una próxima fecha.
export default function Hero({ proximo }) {
  const { pathname, search } = useLocation()
  const origen = { volverA: `${pathname}${search}#fechas` }
  return (
    <div className="hero-marco">
      <section className={`hero ${proximo ? '' : 'hero--sin-proximo'}`}>
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
            Elegí tu fecha y conocé las opciones para tu próxima noche.
          </p>
          {proximo ? (
            <Boton to={`/eventos/${proximo.id}`} state={origen} clase="boton--grande aparece">
              Ver próxima fecha
            </Boton>
          ) : (
            <a href="#fechas" className="boton boton--oro oro-relleno brillo boton--grande aparece">
              Explorar las fechas
            </a>
          )}
        </div>
        {proximo && <BarraProximaFecha evento={proximo} origen={origen} />}
      </section>
    </div>
  )
}
