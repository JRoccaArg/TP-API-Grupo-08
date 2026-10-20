import Icono from './Icono.jsx'

// Un lugar de la landing, con el mismo estilo que las tarjetas de eventos: su foto (la primera que tenga cargada) y, abajo,
// nombre, dirección y botón. Todo sale de la locación que devuelve el back.
export default function TarjetaLugar({ lugar }) {
  const foto = lugar.imagenes[0]
  return (
    <article className="lugar">
      <a href="#fechas" className="lugar__foto" aria-label={`Ver fechas en ${lugar.nombre}`}>
        {foto ? (
          <img className="ken" src={foto.url} alt={foto.descripcion || `Foto de ${lugar.nombre}`} />
        ) : (
          <span className="lugar__sin-foto">Sin foto</span>
        )}
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
