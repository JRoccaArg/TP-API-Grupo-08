const COPIAS = ['a', 'b']

// Medidas aproximadas (letras de 92 px) para que la cinta ocupe siempre el ancho de la pantalla y vaya a la misma velocidad, con pocos o muchos eventos
const PX_POR_LETRA = 45
const PX_POR_ITEM = 175
const PX_MINIMOS = 2600
const PX_POR_SEGUNDO = 180

// Cinta que se desplaza sola: la marca y, a continuación, cada próximo evento del back. Se dibuja dos veces seguidas para que el bucle no tenga corte
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
