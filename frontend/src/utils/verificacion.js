import { diaYFecha, fechaYHora, horario } from './fechas.js'

// Verificación de entradas con el QR.
// El QR de cada entrada guarda un link a "/verificar/<código>": el organizador lo escanea con la cámara del celular y llega a esa pantalla.
// VITE_URL_PUBLICA es la dirección desde la que se abre el sitio. Para escanear con un celular hay que poner la IP de la PC (ver .env.example).
const URL_PUBLICA = (import.meta.env?.VITE_URL_PUBLICA || 'http://localhost:5173').replace(/\/$/, '')

export const urlVerificacion = (codigoQr) => `${URL_PUBLICA}/verificar/${encodeURIComponent(codigoQr)}`

// Qué se le dice al organizador según el estado de la entrada que devuelve el back. Se busca en la tabla en lugar de usar if/else.
const RESULTADOS = {
  EMITIDO: () => ({ valido: true, titulo: 'Entrada válida', mensaje: 'Podés dejar pasar a esta persona.' }),
  UTILIZADO: (ticket) => ({
    valido: false,
    titulo: 'Entrada ya utilizada',
    mensaje: `Esta entrada ya se usó para ingresar${ticket.fechaUtilizacion ? ` el ${fechaYHora(ticket.fechaUtilizacion)}` : ''}.`,
  }),
  CANCELADO: () => ({ valido: false, titulo: 'Entrada reembolsada', mensaje: 'Esta entrada fue reembolsada y no permite el ingreso.' }),
}
const DESCONOCIDO = () => ({ valido: false, titulo: 'No pudimos verificar la entrada', mensaje: 'El estado de la entrada no es reconocido.' })
const INGRESO_REGISTRADO = { valido: true, titulo: 'Ingreso registrado', mensaje: 'La entrada quedó marcada como utilizada.' }

const OTRO_EVENTO = (ticket) => ({
  valido: false,
  titulo: 'Entrada de otro evento',
  mensaje: `Esta entrada es para "${ticket.eventoTitulo}", no para el evento que estás controlando.`,
})

// "registrado" es true cuando el organizador acaba de registrar el ingreso desde la pantalla.
// "eventoEsperado" (opcional) es el evento que se está controlando con el escáner: una entrada de otro evento no vale.
export const resultadoDeTicket = (ticket, registrado = false, eventoEsperado) => {
  if (registrado) return INGRESO_REGISTRADO
  if (eventoEsperado && ticket.eventoId !== eventoEsperado) return OTRO_EVENTO(ticket)
  return (RESULTADOS[ticket.estado] || DESCONOCIDO)(ticket)
}

// Los datos que se muestran debajo del resultado: a quién pertenece y a qué evento da acceso.
export const datosDeTicket = (ticket) => [
  { etiqueta: 'A nombre de', valor: ticket.compradorNombre },
  { etiqueta: 'Evento', valor: ticket.eventoTitulo },
  { etiqueta: 'Fecha', valor: `${diaYFecha(ticket.eventoFechaHoraInicio)} · ${horario(ticket.eventoFechaHoraInicio, ticket.eventoFechaHoraFin)}` },
  { etiqueta: 'Lugar', valor: ticket.locacionNombre },
  { etiqueta: 'Entrada', valor: ticket.tipoEntradaNombre },
]
