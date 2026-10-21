import { fuerzaClave } from '../utils/clave.js'

// Barra de seguridad de la contraseña nueva: un tramo por cada requisito cumplido. Cambia de color y de texto, de rojo
// (muy débil) a verde (fuerte). Solo orienta: lo que bloquea el registro son los requisitos de ReglasClave.
export default function FuerzaClave({ clave }) {
  const { cumplidas, total, texto } = fuerzaClave(clave)

  return (
    <div className={`fuerza-clave fuerza-clave--${cumplidas}`}>
      <div className="fuerza-clave__barra" aria-hidden="true">
        {Array.from({ length: total }, (_, indice) => (
          <span key={indice} className={indice < cumplidas ? 'fuerza-clave__tramo--lleno' : ''} />
        ))}
      </div>
      <p className="fuerza-clave__texto" aria-live="polite">
        {texto ? <>Seguridad: <strong>{texto}</strong></> : 'Seguridad de la contraseña'}
      </p>
    </div>
  )
}
