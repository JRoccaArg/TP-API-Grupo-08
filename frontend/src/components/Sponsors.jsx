import { sponsors } from '../data/sponsors.js'

const COPIAS = ['a', 'b']
const VUELTAS = ['1', '2']

// "Nos acompañan": logos que se desplazan solos. Mismo truco que Cinta (dos grupos iguales para que el bucle no tenga corte);
// cada grupo repite la lista dos veces para cubrir pantallas anchas (hasta ~5000 px).
export default function Sponsors() {
  return (
    <section className="sponsors">
      <h2 className="sponsors__titulo">NOS ACOMPAÑAN</h2>
      <div className="sponsors__ventana">
        <div className="sponsors__pista">
          {COPIAS.map((copia) => (
            <ul className="sponsors__grupo" key={copia} aria-hidden={copia === 'b'}>
              {VUELTAS.map((vuelta) =>
                sponsors.map((sponsor) => (
                  <li key={`${vuelta}-${sponsor.id}`}>
                    <img
                      src={sponsor.logo}
                      alt={copia === 'a' && vuelta === '1' ? sponsor.nombre : ''}
                      className={`sponsors__logo sponsors__logo--${sponsor.id}`}
                    />
                  </li>
                ))
              )}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
