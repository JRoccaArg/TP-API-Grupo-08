// Campo de formulario con una línea fina abajo. Puede ser controlado (valor + onChange) o sin controlar (valorInicial).
// Opcionales: "error" (un texto, o '' para reservar el lugar), "accion" (botón adentro del campo, por ejemplo el ojo de la
// contraseña) y "sugerencias" (lista de textos que el navegador ofrece mientras se escribe, <datalist>).
export default function CampoLinea({
  etiqueta,
  nombre,
  tipo = 'text',
  valor,
  valorInicial,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  requerido = false,
  extra,
  error,
  inputMode,
  autoComplete,
  accion,
  sugerencias,
}) {
  const idSugerencias = sugerencias ? `${nombre}-sugerencias` : undefined
  return (
    <label className={`campo ${error ? 'campo--error' : ''}`}>
      <span className="campo__etiqueta">
        {etiqueta}
        {extra}
      </span>
      <span className={`campo__caja ${accion ? 'campo__caja--accion' : ''}`}>
        <input
          className="campo__control"
          name={nombre}
          type={tipo}
          value={valor}
          defaultValue={valorInicial}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          required={requerido}
          inputMode={inputMode}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          list={idSugerencias}
        />
        {sugerencias && (
          <datalist id={idSugerencias}>
            {sugerencias.map((texto) => <option key={texto} value={texto} />)}
          </datalist>
        )}
        {accion}
      </span>
      {error !== undefined && (
        <span className="campo__error" role="alert">
          {error}
        </span>
      )}
    </label>
  )
}
