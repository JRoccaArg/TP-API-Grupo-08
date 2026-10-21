import Boton from './Boton.jsx'

// Resultado de la verificación: ✓ o ✕, un título, un mensaje y los datos de la entrada. "children" va abajo (por ejemplo el botón
// para registrar el ingreso). "volverA" (opcional): si se llegó desde el escáner, un botón para escanear la siguiente.
export default function ResultadoVerificacion({ valido, titulo, mensaje, datos = [], volverA, children }) {
  return (
    <main className="pagina">
      <section className={`verificacion ${valido ? 'verificacion--valida' : 'verificacion--invalida'}`} role="status">
        <p className="verificacion__sello" aria-hidden="true">{valido ? '✓' : '✕'}</p>
        <h1 className="verificacion__titulo">{titulo}</h1>
        <p className="verificacion__mensaje">{mensaje}</p>
        {datos.length > 0 && (
          <dl className="verificacion__datos">
            {datos.map((dato) => (
              <div key={dato.etiqueta}>
                <dt>{dato.etiqueta}</dt>
                <dd>{dato.valor}</dd>
              </div>
            ))}
          </dl>
        )}
        {(children || volverA) && (
          <div className="verificacion__acciones">
            {children}
            {volverA && <Boton to={volverA} variante="contorno" clase="boton--grande">Escanear otra entrada</Boton>}
          </div>
        )}
      </section>
    </main>
  )
}
