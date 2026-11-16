import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { enOrdenCarrito } from './pedidosSesion.js'

const URL = '/api/compras'

// Las compras del usuario (rol USER), de la más nueva a la más vieja
export const obtenerMisCompras = createAsyncThunk('compras/obtenerMisCompras', async (token) => {
  const { data } = await axios.get(`${URL}?page=0&size=100`, { headers: { Authorization: `Bearer ${token}` } })
  return data.content
})

export const obtenerCompra = createAsyncThunk('compras/obtenerCompra', async (pedido) => {
  const { token, id } = pedido
  const { data } = await axios.get(`${URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
  return data
})

// Pagar no manda nada: el back compra el carrito abierto, que tiene que estar en la pantalla de pago (EN_PAGO)
export const pagarCarrito = createAsyncThunk('compras/pagarCarrito', async (token, api) => {
  try {
    const { data } = await enOrdenCarrito(api, token, () => axios.post(URL, null, { headers: { Authorization: `Bearer ${token}` } }))
    return data
  } catch (error) {
    return api.rejectWithValue(error.response?.data?.message || 'No pudimos completar el pago.')
  }
})

// Reembolsa las entradas de UN evento de una compra (si ese evento se canceló o reprogramó) y devuelve la compra como quedó
export const reembolsarEvento = createAsyncThunk('compras/reembolsarEvento', async (pedido, { rejectWithValue }) => {
  try {
    const { token, compraId, eventoId } = pedido
    const { data } = await axios.post(`${URL}/${compraId}/eventos/${eventoId}/reembolsar`, null, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos pedir el reembolso.')
  }
})

const comprasSlice = createSlice({
  name: 'compras',
  initialState: {
    items: [],
    loading: false,
    error: null,
    cargado: false,
    ultimaCompra: null,
    pagando: false,
    errorPago: null,
    errorCompra: null,
    reembolsando: null,
    errorReembolso: null,
  },
  reducers: {
    // Al salir: las compras de esa persona no pueden quedar a la vista de la siguiente
    limpiarCompras: (state) => {
      state.items = []
      state.loading = false
      state.error = null
      state.cargado = false
      state.ultimaCompra = null
      state.pagando = false
      state.errorPago = null
      state.errorCompra = null
      state.reembolsando = null
      state.errorReembolso = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerMisCompras.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerMisCompras.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.cargado = true
      })
      .addCase(obtenerMisCompras.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Una compra suelta (por ejemplo, al recargar su pantalla) se suma a la lista una sola vez
      .addCase(obtenerCompra.pending, (state) => {
        state.errorCompra = null
      })
      .addCase(obtenerCompra.fulfilled, (state, action) => {
        const index = state.items.findIndex((compra) => compra.id === action.payload.id)
        if (index === -1) {
          state.items = [...state.items, action.payload]
        }
      })
      .addCase(obtenerCompra.rejected, (state, action) => {
        state.errorCompra = { id: action.meta.arg.id, mensaje: action.error.message }
      })
      .addCase(pagarCarrito.pending, (state) => {
        state.pagando = true
        state.errorPago = null
      })
      // La compra nueva se suma a la lista y queda como la última: la pantalla de pago la usa para ir a su confirmación
      .addCase(pagarCarrito.fulfilled, (state, action) => {
        state.pagando = false
        state.items = [...state.items, action.payload]
        state.ultimaCompra = action.payload
      })
      .addCase(pagarCarrito.rejected, (state, action) => {
        state.pagando = false
        state.errorPago = action.payload
      })
      .addCase(reembolsarEvento.pending, (state, action) => {
        state.reembolsando = action.meta.arg.compraId
        state.errorReembolso = null
      })
      .addCase(reembolsarEvento.fulfilled, (state, action) => {
        state.reembolsando = null
        const index = state.items.findIndex((compra) => compra.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(reembolsarEvento.rejected, (state, action) => {
        state.reembolsando = null
        state.errorReembolso = action.payload
      })
  },
})

export const { limpiarCompras } = comprasSlice.actions
export default comprasSlice.reducer
