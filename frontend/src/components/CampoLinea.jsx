// Campo de formulario con una línea fina abajo. Sirve controlado (valor + onChange)
// o sin controlar (valorInicial), según lo que necesite la pantalla.
// "error" es opcional: con un texto (o '' para reservar el lugar) muestra el aviso debajo del campo.
// "accion" es opcional: un botón que se dibuja adentro del campo, a la derecha (por ejemplo, el ojo de la contraseña).
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
}) {
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
        />
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
