// Conserva la intención de compra en esta pestaña durante el acceso.
const CLAVE = 'zenoir.seleccionPendiente'
let memoria = null
export function guardarSeleccionPendiente(evento, seleccion, volverA) {
  memoria = { evento: { id: evento.id, ofertas: evento.ofertas.map(({ id, precioFinal }) => ({ id, precioFinal })) }, seleccion, volverA }
  try { sessionStorage.setItem(CLAVE, JSON.stringify(memoria)) } catch { /* respaldo en memoria */ }
}
export function leerSeleccionPendiente() {
  try {
    const pendiente = JSON.parse(sessionStorage.getItem(CLAVE)) || memoria
    if (!Number.isSafeInteger(pendiente?.evento?.id) || pendiente.evento.id < 1 ||
        !Array.isArray(pendiente.evento.ofertas) || !Array.isArray(pendiente.seleccion) || !pendiente.seleccion.length ||
        !pendiente.seleccion.every(({ ofertaId, cantidad }) => Number.isSafeInteger(ofertaId) && ofertaId > 0 && Number.isSafeInteger(cantidad) && cantidad > 0)) return null
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
  return pendiente ? `/eventos/${pendiente.evento.id}` : '/'
}
