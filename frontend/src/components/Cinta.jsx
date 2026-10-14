const COPIAS = ['a', 'b']

// Cinta de texto que se desplaza sola. Se dibuja dos veces seguidas para que el bucle no tenga corte.
export default function Cinta({ textos }) {
  return (
    <div className="cinta" aria-hidden="true">
      <div className="cinta__pista">
        {COPIAS.map((copia) => (
          <div className="cinta__grupo" key={copia}>
            {textos.map((texto) => (
              <span className="cinta__item" key={texto}>
                {texto}
                <i className="oro-texto">/</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
