import { diaYFecha, horario } from '../utils/fechas.js'

export default function DatosEvento({ evento }) {
  const { fechaHoraInicio: inicio, fechaHoraFin: fin } = evento
  const ubicacion = [evento.locacionNombre, evento.locacionDireccion].filter(Boolean).join(' · ')
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacion)}`
  const datos = [
    { id: 'fecha', rotulo: 'FECHA', valor: inicio ? diaYFecha(inicio) : 'A confirmar' },
    { id: 'horario', rotulo: 'HORARIO', valor: inicio && fin ? horario(inicio, fin) : 'A confirmar' },
    { id: 'lugar', rotulo: 'LUGAR', valor: ubicacion || 'A confirmar', enlace: ubicacion ? mapa : null },
  ]
  return (
    <>
      <p className="evento__presenta aparece">{evento.categoriaNombre || 'ZENOIR PRESENTA'}</p>
      <h1 className="evento__titulo aparece">{evento.titulo}</h1>
      <dl className="evento__datos aparece">
        {datos.map((dato) => (
          <div key={dato.id}>
            <dt>{dato.rotulo}</dt>
            <dd>{dato.valor}{dato.enlace && (
              <a href={dato.enlace} target="_blank" rel="noreferrer">Cómo llegar</a>
            )}</dd>
          </div>
        ))}
      </dl>
      <p className="evento__descripcion aparece">{evento.descripcion || 'Este evento todavía no tiene descripción.'}</p>
    </>
  )
}
