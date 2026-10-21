import { porcentaje } from '../utils/estadisticas.js'
import { miles, precio } from '../utils/formatos.js'

export default function VentasPorEntrada({ porEntrada }) {
  if (porEntrada.length === 0) {
    return <p className="admin__vacio">Este evento todavía no tiene entradas. Agregalas desde "Editar evento".</p>
  }

  return (
    <table className="ventas-entrada">
      <thead>
        <tr>
          <th>Entrada</th>
          <th>Estado</th>
          <th>Vendidas</th>
          <th>Quedan</th>
          <th>Recaudado</th>
        </tr>
      </thead>
      <tbody>
        {porEntrada.map((entrada) => (
          <tr key={entrada.eventoTipoEntradaId}>
            <td className="ventas-entrada__nombre">{entrada.tipoEntradaNombre}</td>
            <td className="ventas-entrada__estado">{entrada.estado}</td>
            <td>
              {entrada.vendidas} / {entrada.cupo}
              <span className="dato-resumen__barra" aria-hidden="true">
                <span className="oro-relleno" style={{ width: `${porcentaje(entrada.vendidas, entrada.cupo)}%` }} />
              </span>
            </td>
            <td>{miles(entrada.disponibles)}</td>
            <td>{precio(Number(entrada.recaudado))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
