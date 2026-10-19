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
      </div>
      <CintaFotos fotos={filaVertical} formato="vertical" />
      <CintaFotos fotos={filaHorizontal} formato="horizontal" inversa />
    </section>
  )
}
