// Operaciones sobre la lista de fotos de una pantalla de administración. Se hacen en el navegador con lo que
// responde el back, así no hace falta volver a pedir la lista después de cada alta, cambio o baja.
export const reemplazarFoto = (fotos, actualizada) =>
  fotos.map((foto) => (foto.id === actualizada.id ? { ...foto, ...actualizada } : foto))

export const sinFoto = (fotos, id) => fotos.filter((foto) => foto.id !== id)

// La lista con la foto de la posición "indice" movida "salto" lugares (-1 sube, 1 baja).
export function moverFoto(fotos, indice, salto) {
  const nueva = [...fotos]
  const [movida] = nueva.splice(indice, 1)
  nueva.splice(indice + salto, 0, movida)
  return nueva
}

// Se numeran todas de 1 en adelante, en el orden de la lista; devuelve solo las que cambiaron de número.
export const cambiosDeOrden = (fotos) => fotos
  .map((foto, posicion) => ({ foto, orden: posicion + 1 }))
  .filter(({ foto, orden }) => foto.orden !== orden)
