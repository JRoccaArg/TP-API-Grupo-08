// Revisión de los datos del registro antes de mandarlos: dice cuál está mal. El back vuelve a revisar lo mismo
// (DNI de 7 u 8 dígitos, mayor de 18 años, nombres de hasta 100 caracteres), así que acá solo se adelanta el aviso.
export const EDAD_MINIMA = 18
const EDAD_MAXIMA = 120
const LARGO_MAXIMO_NOMBRE = 100

// Años cumplidos a una fecha ("2000-05-10" es el formato del campo de fecha). Devuelve null si la fecha no es válida.
export function edadEn(nacimiento, hoy = new Date()) {
  const [anio, mes, dia] = String(nacimiento).split('-').map(Number)
  if (!anio || !mes || !dia) return null
  let edad = hoy.getFullYear() - anio
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) edad -= 1
  return edad
}

// Devuelve el primer problema que encuentra, o '' si está todo bien.
export function validarRegistro(datos, hoy = new Date()) {
  if (!datos.firstname.trim() || datos.firstname.trim().length > LARGO_MAXIMO_NOMBRE) {
    return 'El nombre es obligatorio y no puede superar los 100 caracteres.'
  }
  if (!datos.lastname.trim() || datos.lastname.trim().length > LARGO_MAXIMO_NOMBRE) {
    return 'El apellido es obligatorio y no puede superar los 100 caracteres.'
  }
  if (!/^\d{7,8}$/.test(datos.dni.trim())) return 'El DNI debe tener 7 u 8 dígitos, sin puntos.'
  const edad = edadEn(datos.fechaNacimiento, hoy)
  if (edad === null || edad < 0 || edad > EDAD_MAXIMA) return 'La fecha de nacimiento no es válida.'
  if (edad < EDAD_MINIMA) return `Tenés que ser mayor de ${EDAD_MINIMA} años para crear una cuenta.`
  return ''
}
