import TarjetaFlyer from './TarjetaFlyer.jsx'

// "Próximas fechas": una fila de tarjetas, una por evento.
export default function SeccionFechas({ eventos }) {
  return (
    <section id="fechas" className="fechas">
      <div className="fechas__cabecera">
        <h2 className="titulo-seccion">PRÓXIMAS FECHAS</h2>
        <p>Conseguí tus entradas para todas las fechas de Zenoir.</p>
      </div>
      <div className="fechas__fila">
        {eventos.map((evento, indice) => (
          <TarjetaFlyer key={evento.id} evento={evento} indice={indice} />
        ))}
      </div>
    </section>
  )
}
