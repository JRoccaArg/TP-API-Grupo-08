import { ordenarImagenes, urlApi, urlImagen } from './apiEventos.js'

// Ayudas para mostrar y ordenar fotos en pantalla. No hacen pedidos: el <img> pide el archivo solo con su ruta.

// Las fotos de una locación no tienen tipo (no hay portada): solo un orden. "descripcion" es el texto alternativo.
export const urlFotoLocacion = (locacionId, foto) => ({
  ...foto,
  descripcion: foto.textoAlternativo,
  url: urlApi(`/locaciones/${locacionId}/imagenes/${foto.id}/archivo`),
})

export const ordenarFotosLocacion = (fotos) => [...fotos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.id - b.id)

// Las fotos de un evento del store con la ruta de cada archivo, la portada primero
export const fotosDelEvento = (evento) => ordenarImagenes((evento.imagenes || []).map((imagen) => urlImagen(evento.id, imagen)))

// { id: evento } con las fotos listas para mostrar, de los eventos de "ids" que ya están en el store
export function eventosConFotos(eventos, ids) {
  const porId = {}
  eventos.filter((evento) => ids.includes(evento.id)).forEach((evento) => {
    porId[evento.id] = { ...evento, imagenes: fotosDelEvento(evento) }
  })
  return porId
}

// La galería del detalle: las fotos del evento y, al final, las del lugar (con otro id, para no pisarse con las del evento)
export const galeriaDelDetalle = (evento, lugar) => [
  ...fotosDelEvento(evento),
  ...ordenarFotosLocacion((lugar?.imagenes || []).map((foto) => urlFotoLocacion(lugar.id, foto)))
    .map((foto) => ({ ...foto, id: `lugar-${foto.id}`, tipoImagenEvento: 'GALERIA' })),
]

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
