import { configureStore } from '@reduxjs/toolkit'
import carritoReducer from './carritoSlice'
import categoriasReducer from './categoriasSlice'
import comprasReducer from './comprasSlice'
import eventosReducer from './eventosSlice'
import locacionesReducer from './locacionesSlice'
import ticketsReducer from './ticketsSlice'
import tiposEntradaReducer from './tiposEntradaSlice'
import usuarioReducer from './usuarioSlice'

export const store = configureStore({
  reducer: {
    usuario: usuarioReducer,
    eventos: eventosReducer,
    categorias: categoriasReducer,
    locaciones: locacionesReducer,
    tiposEntrada: tiposEntradaReducer,
    carrito: carritoReducer,
    compras: comprasReducer,
    tickets: ticketsReducer,
  },
})
