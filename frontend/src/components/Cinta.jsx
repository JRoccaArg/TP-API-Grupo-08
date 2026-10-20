const COPIAS = ['a', 'b']

// Cinta que se desplaza sola: el nombre de la marca y, a continuación, el de cada próximo evento que devolvió el back
// (así se adapta a los eventos que haya cargados). Se dibuja dos veces seguidas para que el bucle no tenga corte.
export default function Cinta({ eventos }) {
  return (
    <div className="cinta" aria-hidden="true">
      <div className="cinta__pista">
        {COPIAS.map((copia) => (
          <div className="cinta__grupo" key={copia}>
            <span className="cinta__item">
              Zenoir
              <i className="oro-texto">/</i>
            </span>
            {eventos.map((evento) => (
              <span className="cinta__item" key={evento.id}>
                {evento.titulo}
                <i className="oro-texto">/</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
