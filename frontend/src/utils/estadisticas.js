import { pedir } from './pedir.js'

// Cómo viene un evento (solo ADMIN): { vendidas, cupoTotal, recaudado, compras, ingresados, porEntrada: [...] }.
// Lo calcula el back con las compras confirmadas, así que lo recaudado es lo que realmente se pagó.
export const obtenerEstadisticas = (token, eventoId) => pedir('GET', `/eventos/${eventoId}/estadisticas`, token)

// Qué porcentaje es "parte" de "total", redondeado (0 si no hay total).
export const porcentaje = (parte, total) => (total > 0 ? Math.round((parte / total) * 100) : 0)

// Las cuatro tarjetas del resumen, armadas a partir de las estadísticas del back.
export const datosDelResumen = (estadisticas) => [
  {
    etiqueta: 'Entradas vendidas',
    valor: `${estadisticas.vendidas} / ${estadisticas.cupoTotal}`,
    detalle: `${porcentaje(estadisticas.vendidas, estadisticas.cupoTotal)}% del cupo`,
    progreso: porcentaje(estadisticas.vendidas, estadisticas.cupoTotal),
  },
  {
    etiqueta: 'Recaudado',
    valor: `$${Number(estadisticas.recaudado).toLocaleString('es-AR')}`,
    detalle: estadisticas.compras > 0
      ? `Promedio por compra: $${Math.round(estadisticas.recaudado / estadisticas.compras).toLocaleString('es-AR')}`
      : 'Todavía no hay compras',
  },
  {
    etiqueta: 'Compras',
    valor: String(estadisticas.compras),
    detalle: estadisticas.compras === 1 ? '1 compra confirmada' : `${estadisticas.compras} compras confirmadas`,
  },
  {
    etiqueta: 'Ingresaron',
    valor: `${estadisticas.ingresados} / ${estadisticas.vendidas}`,
    detalle: `${porcentaje(estadisticas.ingresados, estadisticas.vendidas)}% de las entradas vendidas`,
    progreso: porcentaje(estadisticas.ingresados, estadisticas.vendidas),
  },
]
