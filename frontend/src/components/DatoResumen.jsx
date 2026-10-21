export default function DatoResumen({ etiqueta, valor, detalle, progreso }) {
  return (
    <li className="dato-resumen">
      <p className="dato-resumen__etiqueta">{etiqueta}</p>
      <p className="dato-resumen__valor">{valor}</p>
      {progreso !== undefined && (
        <span className="dato-resumen__barra" aria-hidden="true">
          <span className="oro-relleno" style={{ width: `${progreso}%` }} />
        </span>
      )}
      <p className="dato-resumen__detalle">{detalle}</p>
    </li>
  )
}
