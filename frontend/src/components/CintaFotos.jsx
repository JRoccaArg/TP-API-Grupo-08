const COPIAS = ['a', 'b']

// Fila de fotos que se desplaza sola (hacia un lado o hacia el otro). Se repite para no cortar el bucle.
export default function CintaFotos({ fotos, formato, inversa = false }) {
  return (
    <div className="cinta-fotos">
      <div className={`cinta-fotos__pista ${inversa ? 'cinta-fotos__pista--inversa' : ''}`}>
        {COPIAS.map((copia) => (
          <div className="cinta-fotos__grupo" key={copia}>
            {fotos.map((foto) => (
              <img
                key={foto.id}
                src={foto.src}
                alt={copia === 'a' ? foto.alt : ''}
                className={`foto foto--${formato}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
