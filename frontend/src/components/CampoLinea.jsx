// Campo de formulario con una línea fina abajo. Sirve controlado (valor + onChange)
// o sin controlar (valorInicial), según lo que necesite la pantalla.
export default function CampoLinea({
  etiqueta,
  nombre,
  tipo = 'text',
  valor,
  valorInicial,
  onChange,
  placeholder,
  requerido = false,
  extra,
}) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">
        {etiqueta}
        {extra}
      </span>
      <input
        className="campo__control"
        name={nombre}
        type={tipo}
        value={valor}
        defaultValue={valorInicial}
        onChange={onChange}
        placeholder={placeholder}
        required={requerido}
      />
    </label>
  )
}
