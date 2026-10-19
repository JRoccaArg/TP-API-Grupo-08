import Icono from './Icono.jsx'

// Un lugar de la landing, con el mismo estilo que las tarjetas de eventos: foto con etiqueta y, abajo, nombre, dirección y botón.
export default function TarjetaLugar({ lugar }) {
  return (
    <article className="lugar">
      <a href="#fechas" className="lugar__foto" aria-label={`Ver fechas en ${lugar.nombre}`}>
        <img className="ken" src={lugar.imagen} alt={lugar.alt} />
        <span className="lugar__barrio">{lugar.barrio}</span>
      </a>
      <div className="lugar__pie">
        <div>
          <h3 className="lugar__nombre">{lugar.nombre}</h3>
          <p className="lugar__direccion">{lugar.direccion}</p>
        </div>
        <a href="#fechas" className="flyer__ir oro-relleno brillo" aria-label={`Ver fechas en ${lugar.nombre}`}>
          <Icono nombre="diagonal" />
        </a>
      </div>
    </article>
  )
}
