// Textos fijos de la página de inicio.
import { imagenes } from './imagenes.js'

export const cinta = ['Zenoir', 'After Palace', 'Haunted Edition', 'Barra libre', 'Recoleta']

export const filasDonde = [
  {
    id: 1,
    titulo: 'Palacio Balcarce',
    texto: 'Recoleta, Av. Quintana 161. Ahí abren las puertas todas las ediciones de Zenoir.',
    imagen: imagenes.fachada,
    alt: 'Fachada del Palacio Balcarce',
    enlace: { texto: 'Ver fechas', ancla: 'fechas' },
  },
  {
    id: 2,
    titulo: 'Barra libre',
    texto: 'Todas las ediciones incluyen barra libre. Mirá el detalle de cada fecha antes de comprar.',
    imagen: imagenes.barraVaso,
    alt: 'Barra de Zenoir con un vaso naranja',
  },
]
