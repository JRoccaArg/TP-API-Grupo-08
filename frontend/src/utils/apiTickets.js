import { pedir } from './pedir.js'

// Pedidos de la verificación de entradas. Los dos llevan el token del organizador (rol ADMIN).
// "consultarTicket" no gasta la entrada. "utilizarTicket" la marca como usada: 404 si el código no existe y 409 si ya se usó.
const rutaQr = (codigoQr) => `/tickets/qr/${encodeURIComponent(codigoQr)}`

export const consultarTicket = (token, codigoQr) => pedir('GET', rutaQr(codigoQr), token)

export const utilizarTicket = (token, codigoQr) => pedir('POST', `${rutaQr(codigoQr)}/utilizar`, token)
