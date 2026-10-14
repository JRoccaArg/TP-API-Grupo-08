// Ofertas de entradas por evento. Campos parecidos a EventoTipoEntradaResponseDTO.
// estadoVenta (EN_VENTA, AGOTADO, PROXIMAMENTE) es un dato ya calculado en este mock.
export const ofertas = [
  { id: 1, eventoId: 1, tipoEntradaNombre: 'General', descripcion: 'Acceso general. Barra libre.',
    precio: 18000, porcentajeDescuento: 0, precioFinal: 18000, cantidadDisponible: 800,
    estadoVenta: 'EN_VENTA', fechaInicioVenta: '2026-09-01T00:00:00' },
  { id: 2, eventoId: 1, tipoEntradaNombre: 'VIP', descripcion: 'Ingreso prioritario y sector VIP. Barra libre.',
    precio: 35000, porcentajeDescuento: 20, precioFinal: 28000, cantidadDisponible: 200,
    estadoVenta: 'EN_VENTA', fechaInicioVenta: '2026-09-01T00:00:00' },
  { id: 3, eventoId: 1, tipoEntradaNombre: 'Preventa 1', descripcion: 'Acceso general a precio de preventa.',
    precio: 12000, porcentajeDescuento: 0, precioFinal: 12000, cantidadDisponible: 0,
    estadoVenta: 'AGOTADO', fechaInicioVenta: '2026-09-01T00:00:00' },
  { id: 4, eventoId: 1, tipoEntradaNombre: 'Last call', descripcion: 'Acceso general en las últimas horas de venta.',
    precio: 22000, porcentajeDescuento: 0, precioFinal: 22000, cantidadDisponible: 150,
    estadoVenta: 'PROXIMAMENTE', fechaInicioVenta: '2026-10-22T00:00:00' },
  { id: 5, eventoId: 2, tipoEntradaNombre: 'General', descripcion: 'Acceso general. Open bar.',
    precio: 25000, porcentajeDescuento: 0, precioFinal: 25000, cantidadDisponible: 600,
    estadoVenta: 'EN_VENTA', fechaInicioVenta: '2026-09-15T00:00:00' },
  { id: 6, eventoId: 2, tipoEntradaNombre: 'VIP', descripcion: 'Ingreso prioritario y sector VIP. Open bar.',
    precio: 45000, porcentajeDescuento: 15, precioFinal: 38250, cantidadDisponible: 100,
    estadoVenta: 'EN_VENTA', fechaInicioVenta: '2026-09-15T00:00:00' },
]
