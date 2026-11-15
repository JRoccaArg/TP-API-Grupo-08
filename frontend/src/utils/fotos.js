import { urlApi } from './apiEventos.js'

// Ayudas para mostrar y ordenar fotos en pantalla. No hacen pedidos: el <img> pide el archivo solo con su ruta.

// Las fotos de una locación no tienen tipo (no hay portada): solo un orden. "descripcion" es el texto alternativo.
export const urlFotoLocacion = (locacionId, foto) => ({
  ...foto,
  descripcion: foto.textoAlternativo,
  url: urlApi(`/locaciones/${locacionId}/imagenes/${foto.id}/archivo`),
})

export const ordenarFotosLocacion = (fotos) => [...fotos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.id - b.id)

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
