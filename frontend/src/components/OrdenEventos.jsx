// Selector de orden por fecha del catálogo: dos opciones, una activa. No guarda nada: avisa la elegida.
const OPCIONES = [
  { valor: 'antiguos', texto: 'Más antiguos' },
  { valor: 'lejanos', texto: 'Más lejanos' },
]

export default function OrdenEventos({ orden, onCambiar }) {
  return (
    <div className="catalogo-orden" role="group" aria-label="Ordenar por fecha">
      <span className="catalogo-orden__rotulo">Ordenar por fecha</span>
      <div className="catalogo-orden__opciones">
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            className={orden === opcion.valor ? 'catalogo-orden__opcion catalogo-orden__opcion--activa' : 'catalogo-orden__opcion'}
            aria-pressed={orden === opcion.valor}
            onClick={() => onCambiar(opcion.valor)}
          >
            {opcion.texto}
          </button>
        ))}
      </div>
    </div>
  )
}
