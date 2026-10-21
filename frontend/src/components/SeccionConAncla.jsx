import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Sección del inicio a la que se puede llegar con un ancla ("/#fotos"). Si se viene desde otra pantalla, la página
// no baja sola: cuando el catálogo ya cargó ("listo", así las secciones no se mueven más) baja suave hasta acá.
// Es el mismo recurso que usa SeccionFechas (useRef con scrollIntoView). Dónde termina lo ajusta scroll-margin-top en el CSS.
export default function SeccionConAncla({ id, className, listo, children }) {
  const { hash } = useLocation()
  const seccion = useRef(null)

  useEffect(() => {
    if (listo && hash === `#${id}`) seccion.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [listo, hash, id])

  return (
    <section ref={seccion} id={id} className={className}>
      {children}
    </section>
  )
}
