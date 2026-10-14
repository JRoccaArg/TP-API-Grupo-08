import FilaDonde from './FilaDonde.jsx'
import { filasDonde } from '../data/landing.js'

export default function SeccionDonde() {
  return (
    <section id="donde" className="donde">
      <div>
        <p className="donde__etiqueta">Dónde</p>
        <h2 className="titulo-seccion">
          TODO PASA
          <br />
          <span className="oro-texto">EN RECOLETA</span>
        </h2>
        <p className="donde__bajada">
          Av. Quintana 161. Cada edición cambia de clima; la casa y la barra libre se quedan.
        </p>
      </div>
      <div className="donde__filas">
        {filasDonde.map((fila) => (
          <FilaDonde key={fila.id} fila={fila} />
        ))}
      </div>
    </section>
  )
}
