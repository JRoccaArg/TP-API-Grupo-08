import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Marca al principio de una sección del inicio. Si se llega desde otra pantalla con "/#ancla" (por ejemplo, "Fotos"
// desde "Mis entradas"), la página no baja sola: cuando el catálogo ya cargó (las secciones no se mueven más),
// se lleva la vista hasta acá. Es el mismo recurso que usa SeccionFechas (useRef con scrollIntoView).
// "instant": el desplazamiento suave del sitio (scroll-behavior: smooth) se cancela mientras la página recién se arma.
export default function MarcaSeccion({ ancla, listo }) {
  const { hash } = useLocation()
  const marca = useRef(null)

  useEffect(() => {
    if (listo && hash === `#${ancla}`) marca.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [listo, hash, ancla])

  return <span ref={marca} className="marca-seccion" aria-hidden="true" />
}
