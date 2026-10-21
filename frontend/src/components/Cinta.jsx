const COPIAS = ['a', 'b']

// Medidas aproximadas de la cinta (letras de 92 px): sirven para que siempre ocupe el ancho de la pantalla y se mueva a la
// misma velocidad, tenga el back un evento o cientos. Un título larguísimo ya no la acelera, ni pocos eventos dejan huecos.
const PX_POR_LETRA = 45
const PX_POR_ITEM = 175
const PX_MINIMOS = 2600
const PX_POR_SEGUNDO = 180

// Cinta que se desplaza sola: el nombre de la marca y, a continuación, el de cada próximo evento que devolvió el back
// (así se adapta a los eventos que haya cargados). Se dibuja dos veces seguidas para que el bucle no tenga corte.
export default function Cinta({ eventos }) {
  const titulos = ['Zenoir', ...eventos.map((evento) => evento.titulo)]
  const ancho = titulos.reduce((suma, titulo) => suma + titulo.length * PX_POR_LETRA + PX_POR_ITEM, 0)
  const vueltas = Math.ceil(PX_MINIMOS / ancho) // veces que se repite la lista dentro de cada grupo
  const segundos = Math.round((ancho * vueltas) / PX_POR_SEGUNDO)

  return (
    <div className="cinta" aria-hidden="true">
      <div className="cinta__pista" style={{ animationDuration: `${segundos}s` }}>
        {COPIAS.map((copia) => (
          <div className="cinta__grupo" key={copia}>
            {Array.from({ length: vueltas }, (_, vuelta) => (
              <div className="cinta__lista" key={vuelta}>
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
        ))}
      </div>
    </div>
  )
}
