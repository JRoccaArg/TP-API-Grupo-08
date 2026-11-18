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

// Un evento suelto (el detalle, o uno que está en el carrito o en una compra). Con el token del admin se ve también un borrador.
// Usa rejectWithValue porque el 404 ("el evento no existe") se muestra distinto de un error de conexión, como en la verificación de entradas
export const obtenerEvento = createAsyncThunk('eventos/obtenerEvento', async (pedido, { rejectWithValue }) => {
  try {
    const { id, token } = pedido
    const { data } = await axios.get(`${URL}/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    return data
  } catch (error) {
    return rejectWithValue({
      mensaje: error.response?.data?.message || 'No pudimos cargar el evento.',
      noExiste: error.response?.status === 404,
    })
  }
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

// Saca un evento de las páginas guardadas del catálogo y de los próximos, como el DELETE de una lista (sin volver a pedir)
const sacarDelCatalogo = (state, id) => {
  state.paginas = state.paginas.map((pagina) => ({ ...pagina, ids: pagina.ids.filter((otro) => otro !== id) }))
  if (state.proximos) {
    state.proximos = state.proximos.filter((evento) => evento.id !== id)
  }
}

const eventosSlice = createSlice({
  name: 'eventos',
  initialState: {
    items: [],
    paginas: [],
    loading: false,
    error: null,
    // La búsqueda que se está mirando (action.meta.arg): la respuesta o el error de una anterior no la pisan
    consultaActual: null,
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
        state.loading = true
        state.error = null
        state.consultaActual = action.meta.arg
      })
      .addCase(obtenerCatalogo.fulfilled, (state, action) => {
        if (action.meta.arg === state.consultaActual) {
          state.loading = false
        }
        // Un evento se guarda una sola vez aunque aparezca en varias páginas. Si ya estaba, se actualiza como en el PUT,
        // y se conservan sus fotos y entradas, que se piden aparte
        action.payload.content.forEach((evento) => {
          const index = state.items.findIndex((item) => item.id === evento.id)
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...evento }
          } else {
            state.items = [...state.items, evento]
          }
        })
        // Cada página queda guardada con su consulta (action.meta.arg): si se vuelve a ella, no se pide de nuevo
        state.paginas = [...state.paginas, {
          consulta: action.meta.arg,
          ids: action.payload.content.map((evento) => evento.id),
          total: action.payload.totalElements,
          totalPaginas: action.payload.totalPages,
        }]
      })
      .addCase(obtenerCatalogo.rejected, (state, action) => {
        if (action.meta.arg === state.consultaActual) {
          state.loading = false
          state.error = action.error.message
        }
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
        state.errorEvento = { id: action.meta.arg.id, ...action.payload }
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
      // Un borrador no sale en el catálogo. Uno publicado sí, pero en qué página va lo decide el back:
      // solo entonces se vacían las páginas y los próximos, y se piden recién al volver al inicio
      .addCase(crearEvento.fulfilled, (state, action) => {
        state.items = [...state.items, { ...action.payload, ofertas: [], imagenes: [] }]
        if (state.todos) {
          state.todos = [...state.todos, action.payload.id]
        }
        if (action.payload.estado !== 'BORRADOR') {
          state.paginas = []
          state.proximos = null
        }
      })
      .addCase(crearEvento.rejected, (state, action) => {
        state.errorAdmin = action.payload
      })
      // Los errores de lo que se hace sobre un evento (guardar, borrar, fotos, entradas) se guardan en ese evento.
      // Al guardar o borrar también se borra el error de un alta anterior: el error se resetea en el pending
      .addCase(actualizarEvento.pending, (state, action) => {
        state.errorAdmin = null
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index].errorEdicion = null
        }
      })
      // El cambio se ve en el momento, como dijo la profe: las tarjetas leen el evento de items y no se pide nada.
      // Solo si un borrador se publica no está en ninguna página guardada, y en qué página va lo decide el back
      .addCase(actualizarEvento.fulfilled, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.payload.id)
        const antes = index !== -1 ? state.items[index].estado : null
        if (index !== -1) {
          // Si cambió el fin, el back corrió el cierre de venta de sus entradas: acá se hace lo mismo
          if (state.items[index].ofertas && state.items[index].fechaHoraFin !== action.payload.fechaHoraFin) {
            state.items[index].ofertas.forEach((oferta) => {
              oferta.fechaFinVenta = action.payload.fechaHoraFin
            })
          }
          state.items[index] = { ...state.items[index], ...action.payload }
        }
        // Los próximos guardan una copia del evento: se reemplaza con findIndex, como en el PUT
        if (state.proximos) {
          const indexProximo = state.proximos.findIndex((evento) => evento.id === action.payload.id)
          if (indexProximo !== -1) {
            state.proximos[indexProximo] = { ...state.proximos[indexProximo], ...action.payload }
          }
        }
        if (antes === 'BORRADOR' && action.payload.estado !== 'BORRADOR') {
          state.paginas = []
          state.proximos = null
        } else if (antes !== 'BORRADOR' && action.payload.estado === 'BORRADOR') {
          sacarDelCatalogo(state, action.payload.id)
        }
      })
      .addCase(actualizarEvento.rejected, (state, action) => {
        const index = state.items.findIndex((evento) => evento.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index].errorEdicion = action.payload
        }
      })
      .addCase(eliminarEvento.pending, (state, action) => {
        state.errorAdmin = null
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
        sacarDelCatalogo(state, action.payload)
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
      // Entradas: se guardan en su evento y la tarjeta del catálogo las lee de ahí, así que el cambio se ve en el momento.
      // Si una es más cara que el máximo del filtro de precio, el máximo sube con la respuesta.
      // Las ventas del resumen no se tocan: se actualizan con «Actualizar ventas»
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
        if (state.rangoPrecios !== null && action.payload.precioFinal > state.rangoPrecios) {
          state.rangoPrecios = action.payload.precioFinal
        }
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
        if (state.rangoPrecios !== null && action.payload.precioFinal > state.rangoPrecios) {
          state.rangoPrecios = action.payload.precioFinal
        }
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
