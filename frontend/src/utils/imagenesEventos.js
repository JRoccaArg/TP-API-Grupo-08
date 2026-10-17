import { imagenes } from '../data/imagenes.js'

// Sólo los cuatro títulos del catálogo original tienen un flyer local asociado.
// Una coincidencia parcial como "Halloween Night - Edición 80" no identifica esa fiesta.
const REFERENCIAS = {
  'after palace': imagenes.flyerAfter,
  'haunted edition': imagenes.flyerHaunted,
  'golden edition': imagenes.flyerGolden,
  'vol. 4 · secret location': imagenes.flyerVol4,
}

export function imagenReferenciaEvento(titulo) {
  const nombre = String(titulo || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const flyer = REFERENCIAS[nombre]
  return { url: flyer || imagenes.neon, esFlyer: Boolean(flyer) }
}
