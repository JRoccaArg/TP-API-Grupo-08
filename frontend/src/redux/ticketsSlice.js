import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const URL = '/api/tickets/qr'

// Consulta la entrada sin gastarla (solo el organizador, rol ADMIN). El código viene del QR: va escapado en la URL.
// Usa rejectWithValue porque el 404 ("el código no existe") se muestra distinto de un error de conexión.
export const consultarTicket = createAsyncThunk('tickets/consultarTicket', async (pedido, { rejectWithValue }) => {
  try {
    const { token, codigo } = pedido
    const { data } = await axios.get(`${URL}/${encodeURIComponent(codigo)}`, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue({
      mensaje: error.response?.data?.message || 'No pudimos verificar la entrada.',
      noExiste: error.response?.status === 404,
    })
  }
})

// Registra el ingreso: la entrada queda usada. Si ya se usó (o se reembolsó), el back responde 409 con su mensaje
export const utilizarTicket = createAsyncThunk('tickets/utilizarTicket', async (pedido, { rejectWithValue }) => {
  try {
    const { token, codigo } = pedido
    const { data } = await axios.post(`${URL}/${encodeURIComponent(codigo)}/utilizar`, null, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos registrar el ingreso.')
  }
})

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: {
    ticket: null,
    loading: false,
    error: null,
    registrando: false,
    errorRegistro: null,
    ultimoRegistrado: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(consultarTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Se guarda solo la entrada que se está verificando: es el "detalle" del que habló la profe
      .addCase(consultarTicket.fulfilled, (state, action) => {
        state.loading = false
        state.ticket = action.payload
        state.errorRegistro = null
      })
      // El error queda con su código, así no se muestra en la verificación de otra entrada
      .addCase(consultarTicket.rejected, (state, action) => {
        state.loading = false
        state.error = { codigo: action.meta.arg.codigo, ...action.payload }
      })
      .addCase(utilizarTicket.pending, (state) => {
        state.registrando = true
        state.errorRegistro = null
      })
      // Se recuerda qué código se registró: si el POST falla (alguien la usó antes), no se muestra "Ingreso registrado"
      .addCase(utilizarTicket.fulfilled, (state, action) => {
        state.registrando = false
        state.ticket = action.payload
        state.ultimoRegistrado = action.meta.arg.codigo
      })
      .addCase(utilizarTicket.rejected, (state, action) => {
        state.registrando = false
        state.errorRegistro = action.payload
      })
  },
})

export default ticketsSlice.reducer
