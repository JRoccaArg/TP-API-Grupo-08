import { combineReducers, configureStore } from '@reduxjs/toolkit'
import carritoReducer from './carritoSlice.js'
import categoriasReducer from './categoriasSlice.js'
import comprasReducer from './comprasSlice.js'
import eventosReducer from './eventosSlice.js'
import locacionesReducer from './locacionesSlice.js'
import ticketsReducer from './ticketsSlice.js'
import tiposEntradaReducer from './tiposEntradaSlice.js'
import usuarioReducer from './usuarioSlice.js'
import { crearColaCarrito, protegerSesion } from './pedidosSesion.js'

const reducers = combineReducers({
  usuario: usuarioReducer,
  eventos: eventosReducer,
  categorias: categoriasReducer,
  locaciones: locacionesReducer,
  tiposEntrada: tiposEntradaReducer,
  carrito: carritoReducer,
  compras: comprasReducer,
  tickets: ticketsReducer,
})

function reducer(state, action) {
  const siguiente = reducers(state, action)
  if (state && siguiente.usuario.sesion !== state.usuario.sesion) {
    // También se limpian tickets y datos administrativos al cambiar de cuenta.
    return { ...reducers(undefined, { type: '@@sesion/reiniciar' }), usuario: siguiente.usuario }
  }
  return siguiente
}

export const crearStore = () => configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    thunk: { extraArgument: { colaCarrito: crearColaCarrito() } },
  }).concat(protegerSesion),
})

export const store = crearStore()
