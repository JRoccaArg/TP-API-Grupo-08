import { diaYFecha, horario } from '../utils/fechas.js'

// Título del evento y la fila con fecha, horario y lugar.
export default function DatosEvento({ evento }) {
  const { fechaHoraInicio: inicio, fechaHoraFin: fin } = evento
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${evento.locacionNombre} ${evento.locacionDireccion}`,
  )}`
  const datos = [
    { id: 'fecha', rotulo: 'FECHA', valor: diaYFecha(inicio) },
    { id: 'horario', rotulo: 'HORARIO', valor: horario(inicio, fin) },
    { id: 'lugar', rotulo: 'LUGAR', valor: `${evento.locacionNombre}, Recoleta`, enlace: mapa },
  ]

  return (
    <>
      <p className="evento__presenta aparece">ZENOIR PRESENTA</p>
      <h1 className="evento__titulo aparece">{evento.titulo}</h1>
      <dl className="evento__datos aparece">
        {datos.map((dato) => (
          <div key={dato.id}>
            <dt>{dato.rotulo}</dt>
            <dd>
              {dato.valor}
              {dato.enlace && (
                <a href={dato.enlace} target="_blank" rel="noreferrer">
                  Cómo llegar
                </a>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="evento__descripcion aparece">{evento.descripcion}</p>
    </>
  )
}
