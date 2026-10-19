// Textos fijos de la página de inicio.
import { imagenes } from './imagenes.js'

// Los lugares donde se hacen las ediciones (fijos, no salen de la base).
export const lugares = [
  {
    id: 1,
    nombre: 'Palacio Balcarce',
    barrio: 'Recoleta',
    direccion: 'Av. Quintana 161',
    imagen: imagenes.fachada,
    alt: 'Fachada del Palacio Balcarce',
  },
  {
    id: 2,
    nombre: 'Círculo Italiano de Buenos Aires',
    barrio: 'Recoleta',
    direccion: 'Libertad 1264',
    imagen: imagenes.circuloItaliano,
    alt: 'Entrada del Círculo Italiano de Buenos Aires',
  },
]
