// Datos de ejemplo. Los campos se llaman igual que en EventoResponse del backend.
// "flyer" y "ventas" son extras de este mock: el backend hoy no los devuelve en GET /eventos.
import { imagenes } from './imagenes.js'

const sede = {
  locacionId: 1,
  locacionNombre: 'Palacio Balcarce',
  locacionDireccion: 'Av. Quintana 161',
  categoriaId: 1,
  categoriaNombre: 'Música',
}

export const eventos = [
  {
    id: 1,
    titulo: 'After Palace',
    descripcion: 'Una noche de barra libre en Palacio Balcarce.',
    estado: 'ACTIVO',
    ...sede,
    fechaHoraInicio: '2026-10-24T22:00:00',
    fechaHoraFin: '2026-10-25T03:00:00',
    flyer: imagenes.flyerAfter,
    precioDesde: 18000,
    ventas: { tipos: 3, vendidas: 312, total: 800 },
  },
  {
    id: 2,
    titulo: 'Haunted Edition',
    descripcion: 'Open bar toda la noche en Palacio Balcarce.',
    estado: 'ACTIVO',
    ...sede,
    fechaHoraInicio: '2026-10-31T23:59:00',
    fechaHoraFin: '2026-11-01T05:00:00',
    flyer: imagenes.flyerHaunted,
    precioDesde: 25000,
    ventas: { tipos: 2, vendidas: 576, total: 800 },
  },
  {
    id: 3,
    titulo: 'Golden Edition',
    descripcion: 'Edición dorada de Zenoir.',
    estado: 'FINALIZADO',
    ...sede,
    fechaHoraInicio: '2026-07-31T23:59:00',
    fechaHoraFin: '2026-08-01T05:00:00',
    flyer: imagenes.flyerGolden,
    precioDesde: 0,
    ventas: { tipos: 2, vendidas: 800, total: 800 },
  },
  {
    id: 4,
    titulo: 'Vol. 4 · Secret Location',
    descripcion: 'Cuarta edición, ubicación secreta.',
    estado: 'FINALIZADO',
    ...sede,
    fechaHoraInicio: '2026-09-13T22:00:00',
    fechaHoraFin: '2026-09-14T03:00:00',
    flyer: imagenes.flyerVol4,
    precioDesde: 0,
    ventas: { tipos: 1, vendidas: 352, total: 400 },
  },
]
