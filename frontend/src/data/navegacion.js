// Enlaces del header según el rol. "ancla" apunta a una sección de la página de inicio.
const base = [
  { texto: 'Inicio', ruta: '/' },
  { texto: 'Fechas', ruta: '/', ancla: 'fechas', activaEn: '/eventos' },
  { texto: 'Fotos', ruta: '/', ancla: 'fotos' },
  { texto: 'Dónde', ruta: '/', ancla: 'donde' },
]

export const enlaces = {
  VISITANTE: base,
  USER: [...base, { texto: 'Mis entradas', ruta: '/mis-entradas' }],
  ADMIN: [...base, { texto: 'Gestionar eventos', ruta: '/admin' }],
}
