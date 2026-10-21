// Validación básica de una tarjeta de demostración: solo comprueba que el formato tenga sentido.
// Los datos de la tarjeta nunca salen del navegador ni se mandan al backend.
export const tarjetaVacia = { numero: '', nombre: '', vencimiento: '', cvv: '' }
export const tarjetaPrueba = { numero: '4242424242424242', nombre: 'Juan Perez', vencimiento: '1230', cvv: '123' }

export const soloDigitos = (texto) => texto.replace(/\D/g, '')

// La marca se deduce de los primeros dígitos: 4 Visa, 51-55 y 2221-2720 Mastercard, 34 y 37 American Express.
export const detectarMarca = (digitos) => {
  if (/^4/.test(digitos)) return 'visa'
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/.test(digitos)) return 'mastercard'
  if (/^3[47]/.test(digitos)) return 'amex'
  return ''
}

const largoNumero = (marca) => (marca === 'amex' ? 15 : 16)
const largoCvv = (marca) => (marca === 'amex' ? 4 : 3)
const grupos = (marca) => (marca === 'amex' ? [4, 6, 5] : [4, 4, 4, 4])

// "4242424242424242" -> "4242 4242 4242 4242"
export const agruparNumero = (digitos, marca = detectarMarca(digitos)) => {
  const partes = []
  let desde = 0
  grupos(marca).forEach((largo) => {
    if (digitos.length > desde) partes.push(digitos.slice(desde, desde + largo))
    desde += largo
  })
  return partes.join(' ')
}

export const numeroVisual = (digitos, marca) => {
  const total = largoNumero(marca)
  return agruparNumero((digitos + '•'.repeat(total)).slice(0, total), marca)
}

// "1230" -> "12/30"
export const formatearVencimiento = (digitos) =>
  digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos

export const limpiarCampo = (campo, texto, numeroActual) => {
  if (campo === 'numero') {
    const digitos = soloDigitos(texto)
    return digitos.slice(0, largoNumero(detectarMarca(digitos)))
  }
  if (campo === 'nombre') return texto.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]/g, '').slice(0, 26)
  if (campo === 'vencimiento') return soloDigitos(texto).slice(0, 4)
  return soloDigitos(texto).slice(0, largoCvv(detectarMarca(numeroActual)))
}

// Suma de control (algoritmo de Luhn): detecta números mal tipeados sin consultar a ningún banco.
export const luhn = (digitos) => {
  let suma = 0
  let doble = false
  for (let i = digitos.length - 1; i >= 0; i--) {
    let n = Number(digitos[i])
    if (doble) {
      n *= 2
      if (n > 9) n -= 9
    }
    suma += n
    doble = !doble
  }
  return suma % 10 === 0
}

const errorNumero = (digitos, marca) => {
  if (digitos.length === 0) return 'Ingresá el número de tu tarjeta.'
  if (digitos.length !== largoNumero(marca)) return `El número debe tener ${largoNumero(marca)} dígitos.`
  if (!luhn(digitos)) return 'Revisá el número: no parece una tarjeta válida.'
  return ''
}

const errorNombre = (nombre) => {
  const palabras = nombre.trim().split(/\s+/)
  return nombre.trim().length >= 3 && palabras.length >= 2 ? '' : 'Ingresá nombre y apellido como figuran en la tarjeta.'
}

const errorVencimiento = (digitos, hoy) => {
  if (digitos.length < 4) return 'Ingresá el vencimiento como MM/AA.'
  const mes = Number(digitos.slice(0, 2))
  const anio = 2000 + Number(digitos.slice(2))
  if (mes < 1 || mes > 12) return 'El mes debe estar entre 01 y 12.'
  if (anio * 12 + mes < hoy.getFullYear() * 12 + hoy.getMonth() + 1) return 'La tarjeta está vencida.'
  if (anio > hoy.getFullYear() + 20) return 'Revisá el año de vencimiento.'
  return ''
}

const errorCvv = (digitos, marca) =>
  digitos.length === largoCvv(marca) ? '' : `El código tiene ${largoCvv(marca)} dígitos.`

export const erroresTarjeta = (tarjeta, hoy = new Date()) => {
  const marca = detectarMarca(tarjeta.numero)
  return {
    numero: errorNumero(tarjeta.numero, marca),
    nombre: errorNombre(tarjeta.nombre),
    vencimiento: errorVencimiento(tarjeta.vencimiento, hoy),
    cvv: errorCvv(tarjeta.cvv, marca),
  }
}

export const tarjetaValida = (errores) => Object.values(errores).every((mensaje) => mensaje === '')
