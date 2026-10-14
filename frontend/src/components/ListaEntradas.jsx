import FilaEntrada from './FilaEntrada.jsx'
import { cantidadDe } from '../utils/carrito.js'

export default function ListaEntradas({ ofertas, seleccion, onCambiar }) {
  return (
    <section className="entradas">
      <div className="entradas__cabecera">
        <h2>Elegí tus entradas</h2>
        <span>Precio final, sin cargos</span>
      </div>
      <ul className="entradas__lista">
        {ofertas.map((oferta) => (
          <FilaEntrada
            key={oferta.id}
            oferta={oferta}
            cantidad={cantidadDe(seleccion, oferta.id)}
            onCambiar={onCambiar}
          />
        ))}
      </ul>
    </section>
  )
}
