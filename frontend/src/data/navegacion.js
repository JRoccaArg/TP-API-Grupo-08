// Enlaces del header según el rol. "ancla" apunta a una sección de la página de inicio.
// Un enlace con "menu" no navega: abre un desplegable con esos enlaces (el admin los agrupa en "Administrar").
const base = [
  { texto: 'Inicio', ruta: '/' },
  { texto: 'Fechas', ruta: '/', ancla: 'fechas', activaEn: '/eventos' },
  { texto: 'Fotos', ruta: '/', ancla: 'fotos' },
  { texto: 'Dónde', ruta: '/', ancla: 'donde' },
]

export const enlaces = {
  VISITANTE: base,
  USER: [...base, { texto: 'Mis entradas', ruta: '/mis-entradas' }],
  ADMIN: [
    ...base,
    {
      texto: 'Administrar',
      menu: [
        { texto: 'Gestionar eventos', ruta: '/admin', excluye: ['/admin/locaciones', '/admin/tipos-entrada'] },
        { texto: 'Locaciones', ruta: '/admin/locaciones' },
        { texto: 'Tipos de entrada', ruta: '/admin/tipos-entrada' },
      ],
    },
  ],
}
