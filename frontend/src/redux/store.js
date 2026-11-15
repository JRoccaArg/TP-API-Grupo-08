import { configureStore } from '@reduxjs/toolkit'
import categoriasReducer from './categoriasSlice'
import eventosReducer from './eventosSlice'
import locacionesReducer from './locacionesSlice'
import tiposEntradaReducer from './tiposEntradaSlice'

export const store = configureStore({
  reducer: {
    eventos: eventosReducer,
    categorias: categoriasReducer,
    locaciones: locacionesReducer,
    tiposEntrada: tiposEntradaReducer,
  },
})
