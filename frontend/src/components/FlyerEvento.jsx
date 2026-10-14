export default function FlyerEvento({ evento }) {
  return (
    <div className="evento__flyer">
      <img className="ken" src={evento.flyer} alt={`Flyer de ${evento.titulo}`} />
    </div>
  )
}
