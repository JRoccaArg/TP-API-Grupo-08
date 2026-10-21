// Lista desplegable con el estilo de CampoLinea. "opciones" es [{ valor, texto }]. Controlada (valor + onChange) o sin controlar (valorInicial)
export default function CampoSelect({ etiqueta, nombre, opciones, valorInicial, valor, onChange }) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">{etiqueta}</span>
      <select className="campo__control" name={nombre} defaultValue={valorInicial} value={valor} onChange={onChange}>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
    </label>
  )
}
