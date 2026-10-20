import MarcaSeccion from './MarcaSeccion.jsx'
import TarjetaLugar from './TarjetaLugar.jsx'
import { lugares } from '../data/landing.js'

// Cabecera (título a la izquierda, bajada a la derecha) y una tarjeta por cada lugar.
export default function SeccionDonde({ listo }) {
  return (
    <section id="donde" className="donde">
      <MarcaSeccion ancla="donde" listo={listo} />
      <div className="donde__cabecera">
        <div>
          <p className="donde__etiqueta">Dónde</p>
          <h2 className="titulo-seccion">
            NUESTROS
            <br />
            <span className="oro-texto">LUGARES</span>
          </h2>
        </div>
        <p className="donde__bajada">Cada edición cambia de clima y a veces de casa. Cada fecha indica su lugar.</p>
      </div>
      <div className="donde__lugares">
        {lugares.map((lugar) => (
          <TarjetaLugar key={lugar.id} lugar={lugar} />
        ))}
      </div>
    </section>
  )
}
