// Fechas del backend (texto ISO sin zona, ej. "2026-10-24T22:00:00") -> textos para la pantalla.
import { capitalizar, dos } from './formatos.js'

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const UN_MINUTO = 60 * 1000

const hora = (fecha) =>
  fecha.getMinutes() === 0 ? dos(fecha.getHours()) : `${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`

export const fechaLarga = (iso) => {
  const fecha = new Date(iso)
  return `${fecha.getDate()} de ${capitalizar(MESES[fecha.getMonth()])}`
}

export const diaYFecha = (iso) => {
  const fecha = new Date(iso)
  return `${capitalizar(DIAS[fecha.getDay()])} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`
}

export const fechaCorta = (iso) => {
  const fecha = new Date(iso)
  return `${DIAS[fecha.getDay()].slice(0, 3).toUpperCase()} ${diaMes(iso)}`
}

export const diaMes = (iso) => {
  const fecha = new Date(iso)
  return `${dos(fecha.getDate())}.${dos(fecha.getMonth() + 1)}`
}

export const horario = (inicio, fin) => `${hora(new Date(inicio))} a ${hora(new Date(fin))} h`

// "2026-10-24T22:00:00" -> "2026-10-24T22:00" (formato que usa <input type="datetime-local">)
export const paraInput = (iso) => iso.slice(0, 16)

export const cuentaRegresiva = (iso, ahora = Date.now()) => {
  const minutos = Math.max(0, Math.floor((new Date(iso) - ahora) / UN_MINUTO))
  return { dias: Math.floor(minutos / 1440), horas: Math.floor((minutos % 1440) / 60), minutos: minutos % 60 }
}
