// El orden se guarda en la URL y el servidor lo aplica antes de paginar.
export default function OrdenEventos({ orden, onCambiar }) {
  return (
    <label className="catalogo-orden" htmlFor="eventos-orden">
      <span className="catalogo-orden__rotulo">Ordenar por</span>
      <select id="eventos-orden" value={orden} onChange={(evento) => onCambiar(evento.target.value)}>
        <option value="proximos">Fecha más próxima</option>
        <option value="lejanos">Fecha más lejana</option>
        <option value="menor-precio">Menor precio</option>
        <option value="mayor-precio">Mayor precio</option>
      </select>
    </label>
  )
}
