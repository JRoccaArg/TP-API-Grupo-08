// Eventos y ventanas de venta usan la zona compartida del catálogo.
import { capitalizar } from './formatos.js'

export const ZONA_CATALOGO = 'America/Argentina/Buenos_Aires'
const UN_MINUTO = 60 * 1000

// Compatibilidad con mocks y servidores anteriores que todavía envían LocalDateTime.
// La API actual entrega offset explícito; nunca se usa la zona del navegador.
// Las fechas del carrito traen hasta 7 decimales en los segundos: se recortan a 3 para que cualquier navegador las lea.
const sinExceso = (iso) => (typeof iso === 'string' ? iso.replace(/(\.\d{3})\d+/, '$1') : iso)
export const fechaApi = (iso) => new Date(typeof iso === 'string' &&
  /^\d{4}-\d{2}-\d{2}T/.test(iso) && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? `${sinExceso(iso)}-03:00` : sinExceso(iso))
const partes = (iso) => Object.fromEntries(new Intl.DateTimeFormat('es-AR', {
  timeZone: ZONA_CATALOGO, weekday: 'long', day: 'numeric', month: 'long',
}).formatToParts(fechaApi(iso)).map(({ type, value }) => [type, value]))
const hora = (iso) => new Intl.DateTimeFormat('es-AR', {
  timeZone: ZONA_CATALOGO, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
}).format(fechaApi(iso)).replace(/:00$/, '')

export const fechaLarga = (iso) => {
  const p = partes(iso)
  return `${p.day} de ${capitalizar(p.month)}`
}
export const diaYFecha = (iso) => {
  const p = partes(iso)
  return `${capitalizar(p.weekday)} ${p.day} de ${p.month}`
}
export const diaMes = (iso) => new Intl.DateTimeFormat('es-AR', {
  timeZone: ZONA_CATALOGO, day: '2-digit', month: '2-digit',
}).format(fechaApi(iso)).replace('/', '.')
export const fechaCorta = (iso) => `${partes(iso).weekday.slice(0, 3).toUpperCase()} ${diaMes(iso)}`
export const horario = (inicio, fin) => `${hora(inicio)} a ${hora(fin)} h`
// Día, mes y hora de un momento puntual (por ejemplo, cuándo se usó una entrada): "19/10, 21:03".
export const fechaYHora = (iso) => new Intl.DateTimeFormat('es-AR', {
  timeZone: ZONA_CATALOGO, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
}).format(fechaApi(iso))

// Las solicitudes de edición siguen usando hora local de Buenos Aires, sin offset.
export const paraInput = (iso) => iso.slice(0, 16)
export const cuentaRegresiva = (iso, ahora = Date.now()) => {
  const minutos = Math.max(0, Math.floor((fechaApi(iso) - ahora) / UN_MINUTO))
  return { dias: Math.floor(minutos / 1440), horas: Math.floor((minutos % 1440) / 60), minutos: minutos % 60 }
}

// Un reloj adelantado no debe disparar un ciclo de peticiones cada milisegundo.
export const esperaProximaFecha = (iso, ahora = Date.now()) => {
  const diferencia = fechaApi(iso).getTime() - ahora
  return Number.isFinite(diferencia) && diferencia >= 0
    ? Math.min(diferencia + 1, 2147483647) : UN_MINUTO
}

// "Ahora" en hora de Buenos Aires, con el formato de los campos de fecha ("2026-11-15T23:00").
export const ahoraParaInput = (ahora = Date.now()) => new Intl.DateTimeFormat('sv-SE', {
  timeZone: ZONA_CATALOGO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
}).format(ahora).replace(' ', 'T')
