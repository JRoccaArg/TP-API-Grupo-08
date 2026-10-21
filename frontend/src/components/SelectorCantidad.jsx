import Icono from './Icono.jsx'

export default function SelectorCantidad({ cantidad, onCambiar, nombre, maximo = 10, deshabilitado = false }) {
  return (
    <div className="selector" role="group" aria-label={`Cantidad de entradas ${nombre}`}>
      <button
        type="button"
        className="selector__boton"
        disabled={deshabilitado || cantidad === 0}
        aria-label={`Quitar una entrada ${nombre}`}
        onClick={() => onCambiar(cantidad - 1)}
      >
        <Icono nombre="menos" tamano={16} grosor={2} />
      </button>
      <span className={`selector__valor ${cantidad > 0 ? 'oro-texto' : ''}`}>{cantidad}</span>
      <button
        type="button"
        className="selector__boton oro-relleno"
        disabled={deshabilitado || cantidad >= maximo}
        aria-label={`Agregar una entrada ${nombre}`}
        onClick={() => onCambiar(cantidad + 1)}
      >
        <Icono nombre="mas" tamano={16} grosor={2.2} />
      </button>
    </div>
  )
}
