// Funciones puras de formato: reciben un dato y devuelven el texto listo para mostrar.
export const dos = (numero) => String(numero).padStart(2, '0')

export const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1)

export const precio = (importe) => `$${importe.toLocaleString('es-AR')}`

export const iniciales = (nombre) =>
  nombre
    .split(' ')
    .map((palabra) => palabra[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

// Milisegundos que faltan -> "14:32"
export const formatearTiempo = (milisegundos) => {
  const total = Math.max(0, Math.floor(milisegundos / 1000))
  return `${dos(Math.floor(total / 60))}:${dos(total % 60)}`
}
