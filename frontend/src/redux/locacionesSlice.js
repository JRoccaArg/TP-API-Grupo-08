import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const URL = '/api/locaciones'

export const obtenerLocaciones = createAsyncThunk('locaciones/obtenerLocaciones', async () => {
  const { data } = await axios.get(`${URL}?page=0&size=100`)
  return data.content
})

// Las fotos son parte de la locación: se guardan adentro de la que se pidió (su id llega en action.meta.arg)
export const obtenerFotosLocacion = createAsyncThunk('locaciones/obtenerFotosLocacion', async (locacionId) => {
  const { data } = await axios.get(`${URL}/${locacionId}/imagenes?page=0&size=100`)
  return data.content
})

export const crearLocacion = createAsyncThunk('locaciones/crearLocacion', async (nuevaLocacion, { rejectWithValue }) => {
  try {
    const { token, nombre, direccion } = nuevaLocacion
    const { data } = await axios.post(URL, { nombre, direccion }, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos crear la locación.')
  }
})

export const actualizarLocacion = createAsyncThunk('locaciones/actualizarLocacion', async (locacion, { rejectWithValue }) => {
  try {
    const { token, id, nombre, direccion } = locacion
    const { data } = await axios.put(`${URL}/${id}`, { nombre, direccion }, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos guardar los cambios.')
  }
})

export const eliminarLocacion = createAsyncThunk('locaciones/eliminarLocacion', async (locacion, { rejectWithValue }) => {
  try {
    const { token, id } = locacion
    await axios.delete(`${URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    return id
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos eliminar la locación.')
  }
})

// El back recibe la foto como formulario con archivo (FormData); axios arma solo el Content-Type
export const subirFotoLocacion = createAsyncThunk('locaciones/subirFotoLocacion', async (foto, { rejectWithValue }) => {
  try {
    const { token, locacionId, archivo, orden, textoAlternativo } = foto
    const formulario = new FormData()
    formulario.append('archivo', archivo)
    formulario.append('textoAlternativo', textoAlternativo)
    formulario.append('orden', String(orden))
    const { data } = await axios.post(`${URL}/${locacionId}/imagenes`, formulario, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos subir la foto.')
  }
})

export const cambiarOrdenFotoLocacion = createAsyncThunk('locaciones/cambiarOrdenFotoLocacion', async (foto, { rejectWithValue }) => {
  try {
    const { token, locacionId, imagenId, orden } = foto
    const formulario = new FormData()
    formulario.append('orden', String(orden))
    const { data } = await axios.patch(`${URL}/${locacionId}/imagenes/${imagenId}`, formulario, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos mover la foto.')
  }
})

export const eliminarFotoLocacion = createAsyncThunk('locaciones/eliminarFotoLocacion', async (foto, { rejectWithValue }) => {
  try {
    const { token, locacionId, imagenId } = foto
    await axios.delete(`${URL}/${locacionId}/imagenes/${imagenId}`, { headers: { Authorization: `Bearer ${token}` } })
    return imagenId
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos quitar la foto.')
  }
})

const locacionesSlice = createSlice({
  name: 'locaciones',
  initialState: {
    items: [],
    loading: false,
    error: null,
    cargado: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerLocaciones.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerLocaciones.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.cargado = true
      })
      .addCase(obtenerLocaciones.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(obtenerFotosLocacion.fulfilled, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg)
        if (index !== -1) {
          state.items[index].imagenes = action.payload
        }
      })
      // Si no se pudieron traer, la locación se muestra sin foto
      .addCase(obtenerFotosLocacion.rejected, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg)
        if (index !== -1) {
          state.items[index].imagenes = []
        }
      })
      .addCase(crearLocacion.pending, (state) => {
        state.error = null
      })
      // Una locación nueva todavía no tiene fotos: así no se piden
      .addCase(crearLocacion.fulfilled, (state, action) => {
        state.items = [...state.items, { ...action.payload, imagenes: [] }]
      })
      .addCase(crearLocacion.rejected, (state, action) => {
        state.error = action.payload
      })
      // Los errores de lo que se hace sobre una locación (guardar, borrar, fotos) se guardan en esa locación.
      // Al guardar o borrar también se borra el error de un alta anterior, como en categorías: el error se resetea en el pending
      .addCase(actualizarLocacion.pending, (state, action) => {
        state.error = null
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index].errorEdicion = null
        }
      })
      .addCase(actualizarLocacion.fulfilled, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload }
        }
      })
      .addCase(actualizarLocacion.rejected, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index].errorEdicion = action.payload
        }
      })
      .addCase(eliminarLocacion.pending, (state, action) => {
        state.error = null
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index].errorEdicion = null
        }
      })
      .addCase(eliminarLocacion.fulfilled, (state, action) => {
        state.items = state.items.filter((locacion) => locacion.id !== action.payload)
      })
      .addCase(eliminarLocacion.rejected, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index].errorEdicion = action.payload
        }
      })
      // Fotos: mientras se guardan, la pantalla deshabilita los botones (guardandoFotos)
      .addCase(subirFotoLocacion.pending, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.locacionId)
        if (index !== -1) {
          state.items[index].guardandoFotos = true
          state.items[index].errorEdicion = null
        }
      })
      .addCase(subirFotoLocacion.fulfilled, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.locacionId)
        if (index !== -1) {
          state.items[index].imagenes = [...state.items[index].imagenes, action.payload]
          state.items[index].guardandoFotos = false
        }
      })
      .addCase(subirFotoLocacion.rejected, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.locacionId)
        if (index !== -1) {
          state.items[index].guardandoFotos = false
          state.items[index].errorEdicion = action.payload
        }
      })
      .addCase(cambiarOrdenFotoLocacion.pending, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.locacionId)
        if (index !== -1) {
          state.items[index].guardandoFotos = true
          state.items[index].errorEdicion = null
        }
      })
      .addCase(cambiarOrdenFotoLocacion.fulfilled, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.locacionId)
        if (index !== -1) {
          const indexFoto = state.items[index].imagenes.findIndex((foto) => foto.id === action.payload.id)
          if (indexFoto !== -1) {
            state.items[index].imagenes[indexFoto] = action.payload
          }
          state.items[index].guardandoFotos = false
        }
      })
      .addCase(cambiarOrdenFotoLocacion.rejected, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.locacionId)
        if (index !== -1) {
          state.items[index].guardandoFotos = false
          state.items[index].errorEdicion = action.payload
        }
      })
      .addCase(eliminarFotoLocacion.pending, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.locacionId)
        if (index !== -1) {
          state.items[index].guardandoFotos = true
          state.items[index].errorEdicion = null
        }
      })
      .addCase(eliminarFotoLocacion.fulfilled, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.locacionId)
        if (index !== -1) {
          state.items[index].imagenes = state.items[index].imagenes.filter((foto) => foto.id !== action.payload)
          state.items[index].guardandoFotos = false
        }
      })
      .addCase(eliminarFotoLocacion.rejected, (state, action) => {
        const index = state.items.findIndex((locacion) => locacion.id === action.meta.arg.locacionId)
        if (index !== -1) {
          state.items[index].guardandoFotos = false
          state.items[index].errorEdicion = action.payload
        }
      })
  },
})

export default locacionesSlice.reducer
