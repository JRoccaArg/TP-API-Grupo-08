// Conserva en esta pestaña la entrada que se quiso agregar sin haber ingresado: { eventoId, ofertaId, cantidad, volverA }.
// Al volver del login, la pantalla del evento la agrega sola (una acción, como el botón "Agregar").
const CLAVE = 'zenoir.seleccionPendiente'
let memoria = null

const valido = (numero) => Number.isSafeInteger(numero) && numero > 0

export function guardarSeleccionPendiente(eventoId, ofertaId, cantidad, volverA) {
  memoria = { eventoId, ofertaId, cantidad, volverA }
  try { sessionStorage.setItem(CLAVE, JSON.stringify(memoria)) } catch { /* respaldo en memoria */ }
}

export function leerSeleccionPendiente() {
  try {
    const pendiente = JSON.parse(sessionStorage.getItem(CLAVE)) || memoria
    if (!valido(pendiente?.eventoId) || !valido(pendiente.ofertaId) || !valido(pendiente.cantidad)) return null
    return pendiente
  } catch { return memoria }
}

export function borrarSeleccionPendiente() {
  memoria = null
  try { sessionStorage.removeItem(CLAVE) } catch { /* sin almacenamiento */ }
}

export function destinoTrasIngresar(sesion) {
  if (sesion.rol !== 'USER') {
    borrarSeleccionPendiente()
    return sesion.rol === 'ADMIN' ? '/admin' : '/'
  }
  const pendiente = leerSeleccionPendiente()
  return pendiente ? `/eventos/${pendiente.eventoId}` : '/'
}
