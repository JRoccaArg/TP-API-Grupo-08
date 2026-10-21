// Requisitos típicos para una contraseña nueva. Solo se piden al crear la cuenta (al ingresar no se vuelve a validar).
const REGLAS = [
  { id: 'largo', texto: 'Entre 8 y 64 caracteres', cumple: (clave) => clave.length >= 8 && clave.length <= 64 },
  { id: 'mayuscula', texto: 'Una letra mayúscula', cumple: (clave) => /[A-ZÁÉÍÓÚÑ]/.test(clave) },
  { id: 'minuscula', texto: 'Una letra minúscula', cumple: (clave) => /[a-záéíóúñ]/.test(clave) },
  { id: 'numero', texto: 'Un número', cumple: (clave) => /\d/.test(clave) },
  { id: 'simbolo', texto: 'Un símbolo (! @ # $ %)', cumple: (clave) => /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(clave) },
]

export const evaluarClave = (clave) => REGLAS.map((regla) => ({ id: regla.id, texto: regla.texto, cumple: regla.cumple(clave) }))

export const claveValida = (clave) => REGLAS.every((regla) => regla.cumple(clave))

// Qué tan segura es la contraseña: cuántos de los requisitos cumple (de 0 a 5) y cómo se llama ese nivel.
const NIVELES = ['', 'Muy débil', 'Débil', 'Media', 'Buena', 'Fuerte']
export function fuerzaClave(clave) {
  const cumplidas = REGLAS.filter((regla) => regla.cumple(clave)).length
  return { cumplidas, total: REGLAS.length, texto: NIVELES[cumplidas] }
}
