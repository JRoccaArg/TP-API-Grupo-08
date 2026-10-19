import { obtenerCategorias } from './apiEventos.js'
import { pedir } from './pedir.js'

// Pedidos de las categorías. Leerlas es público; crear, cambiar y eliminar piden el token del ADMIN.
// Los ids se pasan a texto, igual que en obtenerCategorias, para compararlos con los de los formularios.
export { obtenerCategorias }

const aCategoria = (datos) => ({ nombre: datos.nombre.trim(), activo: datos.activo === 'true' })
const conIdTexto = (categoria) => ({ ...categoria, id: String(categoria.id) })

export const crearCategoria = (token, datos) => pedir('POST', '/categories', token, aCategoria(datos)).then(conIdTexto)

export const actualizarCategoria = (token, id, datos) =>
  pedir('PATCH', `/categories/${id}`, token, aCategoria(datos)).then(conIdTexto)

// Si la categoría tiene eventos, el back responde 409 y no la borra.
export const eliminarCategoria = (token, id) => pedir('DELETE', `/categories/${id}`, token)
