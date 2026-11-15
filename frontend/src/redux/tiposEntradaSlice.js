import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const URL = '/api/tiposEntrada'

// Los tipos de entrada (General, VIP…) se usan en cualquier evento: el precio y el cupo van en cada evento
export const obtenerTiposEntrada = createAsyncThunk('tiposEntrada/obtenerTiposEntrada', async () => {
  const { data } = await axios.get(`${URL}?page=0&size=100`)
  return data.content
})

export const crearTipoEntrada = createAsyncThunk('tiposEntrada/crearTipoEntrada', async (nuevoTipo, { rejectWithValue }) => {
  try {
    const { token, nombre, descripcionBase, activo } = nuevoTipo
    const { data } = await axios.post(URL, { nombre, descripcionBase, activo }, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos crear el tipo de entrada.')
  }
})

export const actualizarTipoEntrada = createAsyncThunk('tiposEntrada/actualizarTipoEntrada', async (tipo, { rejectWithValue }) => {
  try {
    const { token, id, nombre, descripcionBase, activo } = tipo
    const { data } = await axios.put(`${URL}/${id}`, { nombre, descripcionBase, activo }, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos guardar los cambios.')
  }
})

export const eliminarTipoEntrada = createAsyncThunk('tiposEntrada/eliminarTipoEntrada', async (tipo, { rejectWithValue }) => {
  try {
    const { token, id } = tipo
    await axios.delete(`${URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    return id
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos eliminar el tipo de entrada.')
  }
})

const tiposEntradaSlice = createSlice({
  name: 'tiposEntrada',
  initialState: {
    items: [],
    loading: false,
    error: null,
    cargado: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerTiposEntrada.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerTiposEntrada.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.cargado = true
      })
      .addCase(obtenerTiposEntrada.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(crearTipoEntrada.pending, (state) => {
        state.error = null
      })
      .addCase(crearTipoEntrada.fulfilled, (state, action) => {
        state.items = [...state.items, action.payload]
      })
      .addCase(crearTipoEntrada.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(actualizarTipoEntrada.pending, (state) => {
        state.error = null
      })
      .addCase(actualizarTipoEntrada.fulfilled, (state, action) => {
        const index = state.items.findIndex((tipo) => tipo.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(actualizarTipoEntrada.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(eliminarTipoEntrada.pending, (state) => {
        state.error = null
      })
      .addCase(eliminarTipoEntrada.fulfilled, (state, action) => {
        state.items = state.items.filter((tipo) => tipo.id !== action.payload)
      })
      .addCase(eliminarTipoEntrada.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export default tiposEntradaSlice.reducer
