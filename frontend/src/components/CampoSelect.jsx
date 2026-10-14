// Lista desplegable con el mismo estilo que CampoLinea. "opciones" es [{ valor, texto }].
export default function CampoSelect({ etiqueta, nombre, opciones, valorInicial }) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">{etiqueta}</span>
      <select className="campo__control" name={nombre} defaultValue={valorInicial}>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
    </label>
  )
}
