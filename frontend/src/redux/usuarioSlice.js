import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { leerSesion } from '../utils/sesion.js'

// El back tiene el login en /api/v1/auth y el proxy de Vite le saca el primer "/api": por eso va dos veces
const URL = '/api/api/v1/auth'

// Con la respuesta del back se arma la sesión que usa todo el front
const armarSesion = (data) => ({
  token: data.access_token,
  email: data.email,
  nombre: `${data.nombre} ${data.apellido}`.trim(),
  rol: data.role,
})

export const login = createAsyncThunk('usuario/login', async (credenciales, { rejectWithValue }) => {
  try {
    const { email, password } = credenciales
    const { data } = await axios.post(`${URL}/authenticate`, { email: email.trim(), password })
    const sesion = armarSesion(data)
    // El middleware guarda la sesión solo si este pedido sigue vigente.
    return sesion
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos iniciar sesión.')
  }
})

// Al registrarse el back ya devuelve el token: la persona queda con la sesión iniciada
export const registrar = createAsyncThunk('usuario/registrar', async (datos, { rejectWithValue }) => {
  try {
    const { firstname, lastname, dni, fechaNacimiento, email, password } = datos
    const { data } = await axios.post(`${URL}/register`, {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      dni: dni.trim(),
      fechaNacimiento,
      email: email.trim(),
      password,
    })
    const sesion = armarSesion(data)
    return sesion
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos crear tu cuenta.')
  }
})

const usuarioSlice = createSlice({
  name: 'usuario',
  initialState: {
    sesion: leerSesion(), // la de localStorage, si sigue vigente: así sobrevive a F5
    loading: false,
    error: null,
    vencida: false,
  },
  reducers: {
    logout: (state) => {
      state.sesion = null
      state.vencida = false
    },
    // La despacha el reloj de la sesión cuando vence el token: "vencida" deja el aviso hasta que se vuelve a ingresar
    sesionVencida: (state) => {
      state.sesion = null
      state.vencida = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.sesion = action.payload
        state.vencida = false
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(registrar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registrar.fulfilled, (state, action) => {
        state.loading = false
        state.sesion = action.payload
        state.vencida = false
      })
      .addCase(registrar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, sesionVencida } = usuarioSlice.actions
export default usuarioSlice.reducer
