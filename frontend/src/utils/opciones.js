import { capitalizar } from './formatos.js'

export const opcionesDeCatalogo = (lista) => lista.map((item) => ({ valor: item.id, texto: item.nombre }))

export const opcionesDeEstados = (lista) =>
  lista.map((estado) => ({ valor: estado, texto: capitalizar(estado.toLowerCase()) }))
