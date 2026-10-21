import { crearLocacion, obtenerLocaciones } from './apiAdmin.js'
import { crearCategoria, obtenerCategorias } from './apiCategorias.js'
import { buscarPorNombre } from './formEvento.js'

// Crea algo nuevo. Si el back responde 409 (ya existe, por ejemplo porque se creó en un intento anterior que falló
// después), lo busca por nombre en la lista actualizada y usa ese.
const crearOReusar = (crear, releer, nombre) =>
  crear().catch((fallo) => {
    if (fallo.estado !== 409) throw fallo
    return releer().then((lista) => {
      const existente = buscarPorNombre(lista, nombre)
      if (!existente) throw fallo
      return existente
    })
  })

function asegurar(lista, nombre, crear, releer) {
  const existente = buscarPorNombre(lista, nombre)
  if (existente) return Promise.resolve({ elegido: existente, lista })
  return crearOReusar(crear, releer, nombre).then((creado) => {
    const elegido = { ...creado, id: String(creado.id) }
    return { elegido, lista: [...lista.filter((item) => item.id !== elegido.id), elegido] }
  })
}

// Antes de guardar un evento: usa el lugar y la categoría escritos o los crea, y recién después guarda el evento
// con "enviar" (crear o actualizar). Devuelve lo que respondió el back y las listas con lo que se haya creado.
export const guardarEvento = (token, datos, { locaciones, categorias }, enviar) =>
  asegurar(locaciones, datos.lugar, () => crearLocacion(token, { nombre: datos.lugar, direccion: datos.direccion }), obtenerLocaciones)
    .then((lugar) =>
      asegurar(categorias, datos.categoria, () => crearCategoria(token, { nombre: datos.categoria, activo: 'true' }), obtenerCategorias)
        .then((categoria) =>
          enviar({ ...datos, locacionId: lugar.elegido.id, categoriaId: categoria.elegido.id }).then((evento) => ({
            evento,
            opciones: { locaciones: lugar.lista, categorias: categoria.lista },
          }))))
