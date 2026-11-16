import { guardarSesion } from '../utils/sesion.js'

// Cada store lleva su propio registro. Una respuesta iniciada antes de cambiar
// de sesión no debe volver a llenar los slices que acabamos de limpiar.
export const protegerSesion = ({ getState }) => {
  const pedidos = new Map()
  let generacion = 0
  return (next) => (action) => {
    const { requestId, requestStatus } = action.meta || {}
    if (requestStatus === 'pending') pedidos.set(requestId, generacion)
    if (requestStatus === 'fulfilled' || requestStatus === 'rejected') {
      const origen = pedidos.get(requestId)
      pedidos.delete(requestId)
      if (origen !== undefined && origen !== generacion) return action
    }
    const sesion = getState().usuario.sesion
    const resultado = next(action)
    if (getState().usuario.sesion !== sesion) generacion++
    // Persistir solo una autenticación aceptada, nunca una respuesta descartada.
    if (action.type === 'usuario/login/fulfilled' || action.type === 'usuario/registrar/fulfilled') {
      guardarSesion(getState().usuario.sesion)
    }
    return resultado
  }
}

// GET, cambios e inicio/confirmación del pago comparten la misma cola.
// Las promesas viven fuera de Redux; los reducers siguen siendo funciones puras.
export function crearColaCarrito() {
  const colas = new WeakMap()
  return (sesion, getState, operacion) => {
    const anterior = colas.get(sesion) || Promise.resolve()
    const pedido = anterior.then(() => {
      if (getState().usuario.sesion !== sesion) throw new Error('La sesión cambió.')
      return operacion()
    })
    // Un fallo no bloquea los pedidos siguientes.
    const cola = pedido.catch(() => {})
    colas.set(sesion, cola)
    void cola.then(() => {
      if (colas.get(sesion) === cola) colas.delete(sesion)
    })
    return pedido
  }
}

export function enOrdenCarrito({ extra, getState }, token, operacion) {
  const sesion = getState().usuario.sesion
  if (!sesion || sesion.token !== token) return Promise.reject(new Error('La sesión cambió.'))
  return extra.colaCarrito(sesion, getState, operacion)
}
