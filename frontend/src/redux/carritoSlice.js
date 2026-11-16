import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import axios from 'axios'
import { carritoVacio } from '../utils/carrito.js'
import { pagarCarrito } from './comprasSlice.js'
import { enOrdenCarrito } from './pedidosSesion.js'

const URL = '/api/carritos/activo'

// Todos los pedidos del carrito devuelven el carrito completo: el fulfilled lo guarda tal cual. Solo el rol USER tiene carrito
export const obtenerCarrito = createAsyncThunk('carrito/obtenerCarrito', async (token, api) => {
  const { data } = await enOrdenCarrito(api, token, () => axios.get(URL, { headers: { Authorization: `Bearer ${token}` } }))
  return data
})

// El back agrega un tipo de entrada por pedido: por eso cada tipo tiene su propio botón
export const agregarItem = createAsyncThunk('carrito/agregarItem', async (item, api) => {
  try {
    const { token, eventoTipoEntradaId, cantidad } = item
    const { data } = await enOrdenCarrito(api, token, () => axios.post(`${URL}/items`, { eventoTipoEntradaId, cantidad }, { headers: { Authorization: `Bearer ${token}` } }))
    return data
  } catch (error) {
    return api.rejectWithValue(error.response?.data?.message || 'No pudimos agregar las entradas.')
  }
})

// La cantidad es la nueva cantidad total de esa línea; para sacarla se usa quitarItem
export const cambiarCantidad = createAsyncThunk('carrito/cambiarCantidad', async (item, api) => {
  try {
    const { token, itemId, cantidad } = item
    const { data } = await enOrdenCarrito(api, token, () => axios.patch(`${URL}/items/${itemId}`, { cantidad }, { headers: { Authorization: `Bearer ${token}` } }))
    return data
  } catch (error) {
    return api.rejectWithValue(error.response?.data?.message || 'No pudimos cambiar la cantidad.')
  }
})

export const quitarItem = createAsyncThunk('carrito/quitarItem', async (item, api) => {
  try {
    const { token, itemId } = item
    const { data } = await enOrdenCarrito(api, token, () => axios.delete(`${URL}/items/${itemId}`, { headers: { Authorization: `Bearer ${token}` } }))
    return data
  } catch (error) {
    return api.rejectWithValue(error.response?.data?.message || 'No pudimos quitar las entradas.')
  }
})

export const vaciarCarrito = createAsyncThunk('carrito/vaciarCarrito', async (token, api) => {
  try {
    const { data } = await enOrdenCarrito(api, token, () => axios.post(`${URL}/vaciar`, null, { headers: { Authorization: `Bearer ${token}` } }))
    return data
  } catch (error) {
    return api.rejectWithValue(error.response?.data?.message || 'No pudimos vaciar el carrito.')
  }
})

// Se despacha al entrar a /pago: el back pasa el carrito a EN_PAGO y arranca el reloj del pago
export const iniciarPago = createAsyncThunk('carrito/iniciarPago', async (token, api) => {
  try {
    const { data } = await enOrdenCarrito(api, token, () => axios.post(`${URL}/iniciar-pago`, null, { headers: { Authorization: `Bearer ${token}` } }))
    return data
  } catch (error) {
    return api.rejectWithValue(error.response?.data?.message || 'No pudimos abrir el pago.')
  }
})

const operaciones = [obtenerCarrito, agregarItem, cambiarCantidad, quitarItem, vaciarCarrito, iniciarPago, pagarCarrito]

const carritoSlice = createSlice({
  name: 'carrito',
  initialState: {
    carrito: carritoVacio,
    loading: false,
    error: null,
    cargado: false,
    vencido: false,
    guardando: false,
    errorAccion: null,
    agregando: null,
    errorAgregar: null,
    pendientes: {},
  },
  reducers: {
    // Al salir: el carrito de esa persona no puede quedar a la vista de la siguiente
    limpiarCarrito: (state) => {
      state.carrito = carritoVacio
      state.loading = false
      state.error = null
      state.cargado = false
      state.vencido = false
      state.guardando = false
      state.errorAccion = null
      state.agregando = null
      state.errorAgregar = null
      state.pendientes = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerCarrito.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Si el back devuelve otro carrito (otro id), el anterior se venció y sus entradas se liberaron
      .addCase(obtenerCarrito.fulfilled, (state, action) => {
        state.loading = false
        if (state.carrito.id !== null && state.carrito.items.length > 0 && action.payload.id !== state.carrito.id) {
          state.vencido = true
        }
        state.carrito = action.payload
        state.cargado = true
      })
      .addCase(obtenerCarrito.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(agregarItem.pending, (state, action) => {
        state.agregando = action.meta.arg.eventoTipoEntradaId
        state.errorAgregar = null
      })
      .addCase(agregarItem.fulfilled, (state, action) => {
        state.agregando = null
        state.carrito = action.payload
        state.vencido = false
      })
      // El error queda con la entrada que se quiso agregar, así se muestra en su fila
      .addCase(agregarItem.rejected, (state, action) => {
        state.agregando = null
        state.errorAgregar = { ofertaId: action.meta.arg.eventoTipoEntradaId, mensaje: action.payload }
      })
      .addCase(cambiarCantidad.pending, (state) => {
        state.guardando = true
        state.errorAccion = null
      })
      .addCase(cambiarCantidad.fulfilled, (state, action) => {
        state.guardando = false
        state.carrito = action.payload
      })
      .addCase(cambiarCantidad.rejected, (state, action) => {
        state.guardando = false
        state.errorAccion = action.payload
      })
      .addCase(quitarItem.pending, (state) => {
        state.guardando = true
        state.errorAccion = null
      })
      .addCase(quitarItem.fulfilled, (state, action) => {
        state.guardando = false
        state.carrito = action.payload
      })
      .addCase(quitarItem.rejected, (state, action) => {
        state.guardando = false
        state.errorAccion = action.payload
      })
      .addCase(vaciarCarrito.pending, (state) => {
        state.guardando = true
        state.errorAccion = null
      })
      .addCase(vaciarCarrito.fulfilled, (state, action) => {
        state.guardando = false
        state.carrito = action.payload
      })
      .addCase(vaciarCarrito.rejected, (state, action) => {
        state.guardando = false
        state.errorAccion = action.payload
      })
      .addCase(iniciarPago.pending, (state) => {
        state.guardando = true
        state.errorAccion = null
      })
      .addCase(iniciarPago.fulfilled, (state, action) => {
        state.guardando = false
        state.carrito = action.payload
      })
      .addCase(iniciarPago.rejected, (state, action) => {
        state.guardando = false
        state.errorAccion = action.payload
      })
      // La única acción de otro slice que se escucha: al pagar, el back cerró este carrito
      .addCase(pagarCarrito.fulfilled, (state) => {
        state.carrito = carritoVacio
        state.vencido = false
      })
      // Incluye los pedidos en espera: terminar uno no habilita los controles
      // si todavía quedan cambios del mismo carrito por confirmar.
      .addMatcher(isAnyOf(...operaciones.map((operacion) => operacion.pending)), (state, action) => {
        state.pendientes[action.meta.requestId] = {
          tipo: action.type.replace('/pending', ''),
          ofertaId: action.meta.arg?.eventoTipoEntradaId ?? null,
        }
        actualizarOcupado(state)
      })
      .addMatcher(isAnyOf(...operaciones.flatMap((operacion) => [operacion.fulfilled, operacion.rejected])), (state, action) => {
        delete state.pendientes[action.meta.requestId]
        actualizarOcupado(state)
      })
  },
})

export const { limpiarCarrito } = carritoSlice.actions
export default carritoSlice.reducer

function actualizarOcupado(state) {
  const pendientes = Object.values(state.pendientes)
  state.loading = pendientes.some((pedido) => pedido.tipo === obtenerCarrito.typePrefix)
  state.guardando = pendientes.some((pedido) => pedido.tipo !== obtenerCarrito.typePrefix)
  state.agregando = pendientes.find((pedido) => pedido.tipo === agregarItem.typePrefix)?.ofertaId ?? null
}
