import CintaFotos from './CintaFotos.jsx'
import { filaHorizontal, filaVertical } from '../data/fotos.js'

export default function SeccionFotos() {
  return (
    <section id="fotos" className="fotos">
      <div className="fotos__cabecera">
        <h2 className="titulo-seccion">
          ASÍ SE VIVE
          <br />
          <span className="oro-texto">ZENOIR</span>
        </h2>
        <a href="#fotos" className="enlace-oro">
          Ver todas las fotos
        </a>
      </div>
      <CintaFotos fotos={filaVertical} formato="vertical" />
      <CintaFotos fotos={filaHorizontal} formato="horizontal" inversa />
    </section>
  )
}
