export const categorias = [
  { id: 1, nombre: 'Música' },
  { id: 2, nombre: 'Comedia' },
]

export const locaciones = [
  { id: 1, nombre: 'Palacio Balcarce', direccion: 'Av. Quintana 161' },
]

export const estadosEvento = ['ACTIVO', 'BORRADOR', 'FINALIZADO', 'CANCELADO', 'REPROGRAMADO']
// AGOTADO y FINALIZADO los calcula el back: el admin solo pausa o reactiva una entrada.
export const estadosOfertaEditables = ['ACTIVO', 'PAUSADO']
