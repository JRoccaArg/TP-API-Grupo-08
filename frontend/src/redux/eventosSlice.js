import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const URL = '/api/eventos'
const URL_OFERTAS = '/api/eventosTiposEntrada'

// La consulta trae los filtros del catálogo ya armados (página, nombre, categoría, precios, orden y estado)
export const obtenerCatalogo = createAsyncThunk('eventos/obtenerCatalogo', async (consulta) => {
  const { data } = await axios.get(`${URL}?${consulta}`)
  return data
})

export const obtenerProximos = createAsyncThunk('eventos/obtenerProximos', async () => {
  const { data } = await axios.get(`${URL}?page=0&size=5&proximo=true`)
  return data.content
})

export const obtenerRangoPrecios = createAsyncThunk('eventos/obtenerRangoPrecios', async () => {
  const { data } = await axios.get(`${URL}/rango-precios`)
  return data.maximo
})

// Las entradas y las fotos son parte del evento: se guardan adentro de ese evento.
// Las de un borrador solo las ve el admin, por eso el admin manda su token.
export const obtenerOfertas = createAsyncThunk('eventos/obtenerOfertas', async (pedido) => {
  const { eventoId, token } = pedido
  const { data } = await axios.get(`${URL_OFERTAS}/evento/${eventoId}?page=0&size=100`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
  return data.content
})

export const obtenerImagenes = createAsyncThunk('eventos/obtenerImagenes', async (pedido) => {
  const { eventoId, token } = pedido
  const { data } = await axios.get(`${URL}/${eventoId}/imagenes?page=0&size=100`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
  return data.content
})

// Un evento suelto (el detalle, o uno que está en el carrito o en una compra). Con el token del admin se ve también un borrador
export const obtenerEvento = createAsyncThunk('eventos/obtenerEvento', async (pedido) => {
  const { id, token } = pedido
  const { data } = await axios.get(`${URL}/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
  return data
})

// Con el token del admin el back devuelve también los borradores
export const obtenerEventosAdmin = createAsyncThunk('eventos/obtenerEventosAdmin', async (token) => {
  const { data } = await axios.get(`${URL}?page=0&size=100`, { headers: { Authorization: `Bearer ${token}` } })
  return data.content
})

export const obtenerEstadisticas = createAsyncThunk('eventos/obtenerEstadisticas', async (pedido) => {
  const { eventoId, token } = pedido
  const { data } = await axios.get(`${URL}/${eventoId}/estadisticas`, { headers: { Authorization: `Bearer ${token}` } })
  return data
})

// Se separa el token y lo demás es el evento que va en el body
export const crearEvento = createAsyncThunk('eventos/crearEvento', async (nuevoEvento, { rejectWithValue }) => {
  try {
    const { token, ...evento } = nuevoEvento
    const { data } = await axios.post(URL, evento, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos crear el evento.')
  }
})

export const actualizarEvento = createAsyncThunk('eventos/actualizarEvento', async (evento, { rejectWithValue }) => {
  try {
    const { token, id, ...cambios } = evento
    const { data } = await axios.patch(`${URL}/${id}`, cambios, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos guardar los cambios.')
  }
})

export const eliminarEvento = createAsyncThunk('eventos/eliminarEvento', async (evento, { rejectWithValue }) => {
  try {
    const { token, id } = evento
    await axios.delete(`${URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    return id
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos eliminar el evento.')
  }
})

// El back recibe la foto como formulario con archivo (FormData); axios arma solo el Content-Type
export const subirImagen = createAsyncThunk('eventos/subirImagen', async (foto, { rejectWithValue }) => {
  try {
    const { token, eventoId, archivo, tipo, orden, descripcion } = foto
    const formulario = new FormData()
    formulario.append('archivo', archivo)
    formulario.append('tipoImagenEvento', tipo)
    formulario.append('orden', String(orden))
    formulario.append('descripcion', descripcion)
    const { data } = await axios.post(`${URL}/${eventoId}/imagenes`, formulario, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos subir la foto.')
  }
})

// Solo se manda lo que cambia: el tipo (portada o galería) y el orden
export const cambiarImagen = createAsyncThunk('eventos/cambiarImagen', async (foto, { rejectWithValue }) => {
  try {
    const { token, eventoId, imagenId, tipo, orden } = foto
    const formulario = new FormData()
    formulario.append('tipoImagenEvento', tipo)
    formulario.append('orden', String(orden))
    const { data } = await axios.patch(`${URL}/${eventoId}/imagenes/${imagenId}`, formulario, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos cambiar la foto.')
  }
})

export const eliminarImagen = createAsyncThunk('eventos/eliminarImagen', async (foto, { rejectWithValue }) => {
  try {
    const { token, eventoId, imagenId } = foto
    await axios.delete(`${URL}/${eventoId}/imagenes/${imagenId}`, { headers: { Authorization: `Bearer ${token}` } })
    return imagenId
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos quitar la foto.')
  }
})

// Las entradas de un evento: un tipo (General, VIP…) con su precio, descuento, cupo y venta
export const crearOferta = createAsyncThunk('eventos/crearOferta', async (nuevaOferta, { rejectWithValue }) => {
  try {
    const { token, ...oferta } = nuevaOferta
    const { data } = await axios.post(URL_OFERTAS, oferta, { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos agregar la entrada.')
  }
})

export const actualizarOferta = createAsyncThunk('eventos/actualizarOferta', async (oferta, { rejectWithValue }) => {
  try {
    // El estado va solo si lo cambió el admin: si queda undefined, axios no lo manda
    const { token, id, precio, porcentajeDescuento, cantidadTotal, fechaFinVenta, estado } = oferta
    const { data } = await axios.patch(`${URL_OFERTAS}/${id}`, { precio, porcentajeDescuento, cantidadTotal, fechaFinVenta, estado },
      { headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos guardar la entrada.')
  }
})

export const eliminarOferta = createAsyncThunk('eventos/eliminarOferta', async (oferta, { rejectWithValue }) => {
  try {
    const { token, id } = oferta
    await axios.delete(`${URL_OFERTAS}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    return id
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'No pudimos quitar la entrada.')
  }
})

const eventosSlice = createSlice({
  name: 'eventos',
  initialState: {
    items: [],
    paginas: [],
    consultas: {},
    proximos: null,
    rangoPrecios: null,
    errorRango: null,
    pedidos: [],
    errorEvento: null,
    todos: null,
    errorAdmin: null,
    estadisticas: null,
    errorEstadisticas: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerCatalogo.pending, (state, action) => {
        state.consultas[action.meta.arg] = { requestId: action.meta.requestId, loading: true, error: null }
      })
      .addCase(obtenerCatalogo.fulfilled, (state, action) => {
        const consulta = state.consultas[action.meta.arg]
        if (consulta?.requestId !== action.meta.requestId) return
        consulta.loading = false
        consulta.error = null
        // Se conserva una sola copia, pero se actualizan los campos recibidos.
        // Fotos y ofertas ya cargadas se mantienen si el catálogo no las trae.
        action.payload.content.forEach((evento) => {
          const index = state.items.findIndex((item) => item.id === evento.id)
          if (index === -1) {
            state.items = [...state.items, evento]
          } else {
            state.items[index] = { ...state.items[index], ...evento }
          }
        })
        // Cada página queda guardada con su consulta (action.meta.arg): si se vuelve a ella, no se pide de nuevo
        state.paginas = [...state.paginas.filter((pagina) => pagina.consulta !== action.meta.arg), {
          consulta: action.meta.arg,
          ids: action.payload.content.map((evento) => evento.id),
          total: action.payload.totalElements,
          totalPaginas: action.payload.totalPages,
        }]
      })
      .addCase(obtenerCatalogo.rejected, (state, action) => {
        const consulta = state.consultas[action.meta.arg]
        if (consulta?.requestId !== action.meta.requestId) return
        consulta.loading = false
        consulta.error = action.error.message
      })
      .addCase(obtenerProximos.fulfilled, (state, action) => {
        state.proximos = action.payload
      })
      // Sin próximos la portada se muestra igual, sin la próxima fecha
      .addCase(obtenerProximos.rejected, (state) => {
        state.proximos = []
      })
      .addCase(obtenerRangoPrecios.pending, (state) => {
        state.errorRango = null
      })
      .addCase(obtenerRangoPrecios.fulfilled, (state, action) => {
        state.rangoPrecios = action.payload
      })
      .addCase(obtenerRangoPrecios.rejected, (state, action) => {
        state.errorRango = action.error.message
      })
      .addCase(obtenerOfertas.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].ofertas = action.payload
          state.items[index].errorOfertas = ''
        }
      })
      .addCase(obtenerOfertas.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].ofertas = []
          state.items[index].errorOfertas = action.error.message
        }
      })
      // Mientras llegan, la lista vacía marca que ya se pidieron: así otra pantalla no las pide de nuevo
      .addCase(obtenerImagenes.pending, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1 && !state.items[index].imagenes) {
          state.items[index].imagenes = []
        }
      })
      .addCase(obtenerImagenes.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].imagenes = action.payload
          state.items[index].errorImagenes = ''
        }
      })
      .addCase(obtenerImagenes.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].imagenes = []
          state.items[index].errorImagenes = action.error.message
        }
      })
      // "pedidos" es como "cargado", pero por evento: así un evento suelto no se pide dos veces
      .addCase(obtenerEvento.pending, (state, action) => {
        if (!state.pedidos.includes(action.meta.arg.id)) {
          state.pedidos = [...state.pedidos, action.meta.arg.id]
        }
        if (state.errorEvento?.id === action.meta.arg.id) {
          state.errorEvento = null
        }
      })
      .addCase(obtenerEvento.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.payload.id)
        if (index === -1) {
          state.items = [...state.items, action.payload]
        } else {
          state.items[index] = { ...state.items[index], ...action.payload }
        }
      })
      .addCase(obtenerEvento.rejected, (state, action) => {
        state.errorEvento = { id: action.meta.arg.id, mensaje: action.error.message }
      })
      .addCase(obtenerEventosAdmin.pending, (state) => {
        state.errorAdmin = null
      })
      // "todos" guarda solo los ids: los eventos van en items, una sola vez, igual que los del catálogo
      .addCase(obtenerEventosAdmin.fulfilled, (state, action) => {
        action.payload.forEach((evento) => {
          const index = state.items.findIndex((item) => item.id === evento.id)
          if (index === -1) {
            state.items = [...state.items, evento]
          } else {
            state.items[index] = { ...state.items[index], ...evento }
          }
        })
        state.todos = action.payload.map((evento) => evento.id)
      })
      .addCase(obtenerEventosAdmin.rejected, (state, action) => {
        state.errorAdmin = action.error.message
      })
      .addCase(obtenerEstadisticas.pending, (state) => {
        state.errorEstadisticas = null
      })
      .addCase(obtenerEstadisticas.fulfilled, (state, action) => {
        state.estadisticas = action.payload
      })
      .addCase(obtenerEstadisticas.rejected, (state, action) => {
        state.errorEstadisticas = action.error.message
      })
      .addCase(crearEvento.pending, (state) => {
        state.errorAdmin = null
      })
      // Un evento nuevo todavía no tiene entradas ni fotos: así no se piden.
      // Las páginas del catálogo y los próximos que estaban guardados quedaron viejos: se piden al volver al inicio.
      .addCase(crearEvento.fulfilled, (state, action) => {
        state.items = [...state.items, { ...action.payload, ofertas: [], imagenes: [] }]
        if (state.todos) {
          state.todos = [...state.todos, action.payload.id]
        }
        state.paginas = []
        state.proximos = null
      })
      .addCase(crearEvento.rejected, (state, action) => {
        state.errorAdmin = action.payload
      })
      // Los errores de lo que se hace sobre un evento (guardar, borrar, fotos, entradas) se guardan en ese evento
      .addCase(actualizarEvento.pending, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index].errorEdicion = null
        }
      })
      .addCase(actualizarEvento.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.payload.id)
        if (index !== -1) {
          // Si cambió el fin, el back corrió el cierre de venta de sus entradas: acá se hace lo mismo
          if (state.items[index].ofertas && state.items[index].fechaHoraFin !== action.payload.fechaHoraFin) {
            state.items[index].ofertas.forEach((oferta) => {
              oferta.fechaFinVenta = action.payload.fechaHoraFin
            })
          }
          state.items[index] = { ...state.items[index], ...action.payload }
        }
        state.paginas = []
        state.proximos = null
      })
      .addCase(actualizarEvento.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index].errorEdicion = action.payload
        }
      })
      .addCase(eliminarEvento.pending, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index].errorEdicion = null
        }
      })
      .addCase(eliminarEvento.fulfilled, (state, action) => {
        state.items = state.items.filter((evento) => evento.id !== action.payload)
        if (state.todos) {
          state.todos = state.todos.filter((id) => id !== action.payload)
        }
        state.paginas = []
        state.proximos = null
      })
      .addCase(eliminarEvento.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index].errorEdicion = action.payload
        }
      })
      // Fotos: mientras se guardan, la pantalla deshabilita los botones (guardandoFotos)
      .addCase(subirImagen.pending, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].guardandoFotos = true
          state.items[index].errorEdicion = null
        }
      })
      .addCase(subirImagen.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].imagenes = [...state.items[index].imagenes, action.payload]
          state.items[index].guardandoFotos = false
        }
      })
      .addCase(subirImagen.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].guardandoFotos = false
          state.items[index].errorEdicion = action.payload
        }
      })
      .addCase(cambiarImagen.pending, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].guardandoFotos = true
          state.items[index].errorEdicion = null
        }
      })
      .addCase(cambiarImagen.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          const indexFoto = state.items[index].imagenes.findIndex((foto) => foto.id === action.payload.id)
          if (indexFoto !== -1) {
            state.items[index].imagenes[indexFoto] = action.payload
          }
          state.items[index].guardandoFotos = false
        }
      })
      .addCase(cambiarImagen.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].guardandoFotos = false
          state.items[index].errorEdicion = action.payload
        }
      })
      .addCase(eliminarImagen.pending, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].guardandoFotos = true
          state.items[index].errorEdicion = null
        }
      })
      .addCase(eliminarImagen.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].imagenes = state.items[index].imagenes.filter((foto) => foto.id !== action.payload)
          state.items[index].guardandoFotos = false
        }
      })
      .addCase(eliminarImagen.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].guardandoFotos = false
          state.items[index].errorEdicion = action.payload
        }
      })
      // Entradas: cambian el precio más alto, el catálogo y las ventas, así que eso se vuelve a pedir cuando se vea
      .addCase(crearOferta.pending, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].errorEdicion = null
        }
      })
      .addCase(crearOferta.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].ofertas = [...state.items[index].ofertas, action.payload]
        }
        state.rangoPrecios = null
        state.paginas = []
        state.estadisticas = null
      })
      .addCase(crearOferta.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].errorEdicion = action.payload
        }
      })
      .addCase(actualizarOferta.pending, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].errorEdicion = null
        }
      })
      .addCase(actualizarOferta.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          const indexOferta = state.items[index].ofertas.findIndex((oferta) => oferta.id === action.payload.id)
          if (indexOferta !== -1) {
            state.items[index].ofertas[indexOferta] = action.payload
          }
        }
        state.rangoPrecios = null
        state.paginas = []
        state.estadisticas = null
      })
      .addCase(actualizarOferta.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].errorEdicion = action.payload
        }
      })
      .addCase(eliminarOferta.pending, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].errorEdicion = null
        }
      })
      .addCase(eliminarOferta.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].ofertas = state.items[index].ofertas.filter((oferta) => oferta.id !== action.payload)
        }
        state.rangoPrecios = null
        state.paginas = []
        state.estadisticas = null
      })
      .addCase(eliminarOferta.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.eventoId)
        if (index !== -1) {
          state.items[index].errorEdicion = action.payload
        }
      })
  },
})

export default eventosSlice.reducer

const consultaInicial = { loading: false, error: null }
export const seleccionarConsultaCatalogo = (state, consulta) => state.eventos.consultas[consulta] || consultaInicial
