import Icono from './Icono.jsx'

// Una fila de la sección "Dónde": foto cuadrada a la izquierda, texto a la derecha.
export default function FilaDonde({ fila }) {
  return (
    <article className="fila-donde">
      <div className="fila-donde__foto">
        <img className="ken" src={fila.imagen} alt={fila.alt} />
      </div>
      <div>
        <h3>{fila.titulo}</h3>
        <p>{fila.texto}</p>
        {fila.enlace && (
          <a className="fila-donde__enlace" href={`#${fila.enlace.ancla}`}>
            {fila.enlace.texto}
            <span>
              <Icono nombre="diagonal" tamano={15} />
            </span>
          </a>
        )}
      </div>
    </article>
  )
}
