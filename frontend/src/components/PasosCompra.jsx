import { dos } from '../utils/formatos.js'

const PASOS = ['Entradas', 'Carrito', 'Pago']

// Indicador "01 Entradas — 02 Carrito — 03 Pago". "paso" es el número del paso actual.
export default function PasosCompra({ paso }) {
  return (
    <ol className="pasos" aria-label="Pasos de la compra">
      {PASOS.map((nombre, indice) => {
        const numero = indice + 1
        const estado = numero < paso ? 'hecho' : numero === paso ? 'actual' : 'pendiente'
        return (
          <li key={nombre} className={`paso paso--${estado}`}>
            {dos(numero)} {nombre}
          </li>
        )
      })}
    </ol>
  )
}
