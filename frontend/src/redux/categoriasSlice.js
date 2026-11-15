import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const URL = '/api/categories'

export const obtenerCategorias = createAsyncThunk('categorias/obtenerCategorias', async () => {
  const { data } = await axios.get(`${URL}?page=0&size=100`)
  return data.content
})

// El token llega junto con los datos desde el componente, como el id en el updatePost de la profe
export const crearCategoria = createAsyncThunk('categorias/crearCategoria', async (nuevaCategoria, { rejectWithValue }) => {
  try {
    const { token, nombre, activo } = nuevaCategoria
    const { data } = await axios.post(URL, { nombre, activo }, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos crear la categoría.')
  }
})

export const actualizarCategoria = createAsyncThunk('categorias/actualizarCategoria', async (categoria, { rejectWithValue }) => {
  try {
    const { token, id, nombre, activo } = categoria
    const { data } = await axios.patch(`${URL}/${id}`, { nombre, activo }, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos guardar los cambios.')
  }
})

// El back responde 204 sin cuerpo: se devuelve el id para saber cuál sacar de la lista
export const eliminarCategoria = createAsyncThunk('categorias/eliminarCategoria', async (categoria, { rejectWithValue }) => {
  try {
    const { token, id } = categoria
    await axios.delete(`${URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    return id
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos eliminar la categoría.')
  }
})

const categoriasSlice = createSlice({
  name: 'categorias',
  initialState: {
    items: [],
    loading: false,
    error: null,
    cargado: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerCategorias.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerCategorias.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.cargado = true
      })
      .addCase(obtenerCategorias.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(crearCategoria.pending, (state) => {
        state.error = null
      })
      .addCase(crearCategoria.fulfilled, (state, action) => {
        state.items = [...state.items, action.payload]
      })
      .addCase(crearCategoria.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(actualizarCategoria.pending, (state) => {
        state.error = null
      })
      .addCase(actualizarCategoria.fulfilled, (state, action) => {
        const index = state.items.findIndex((categoria) => categoria.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(actualizarCategoria.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(eliminarCategoria.pending, (state) => {
        state.error = null
      })
      .addCase(eliminarCategoria.fulfilled, (state, action) => {
        state.items = state.items.filter((categoria) => categoria.id !== action.payload)
      })
      .addCase(eliminarCategoria.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export default categoriasSlice.reducer
