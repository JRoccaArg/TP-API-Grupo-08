import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import EdicionEvento from '../components/EdicionEvento.jsx'
import { obtenerCategorias } from '../redux/categoriasSlice'
import { obtenerEventosAdmin, obtenerImagenes, obtenerOfertas } from '../redux/eventosSlice'
import { obtenerLocaciones } from '../redux/locacionesSlice'

// Pantalla "/admin/:id/editar": junta lo que necesita la edición y se lo pasa a EdicionEvento. Solo ADMIN.
// Cada dato se pide con su propia acción y solo si todavía no está en el store.
export default function EditarEvento({ usuario }) {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { items, todos, errorAdmin } = useSelector((state) => state.eventos)
  const { items: locaciones, error: errorLocaciones, cargado: locacionesCargadas } = useSelector((state) => state.locaciones)
  const { items: categorias, error: errorCategorias, cargado: categoriasCargadas } = useSelector((state) => state.categorias)
  const esAdmin = usuario?.rol === 'ADMIN'
  const token = esAdmin ? usuario.token : null
  // El id de la URL es texto y el del back es número: se convierte para comparar con triple igual
  const evento = items.find((item) => item.id === Number(id))
  const eventoId = evento?.id
  const conOfertas = Boolean(evento?.ofertas)
  const conImagenes = Boolean(evento?.imagenes)

  // Si se entra directo por la URL, el evento no está en el store: se pide la lista del admin
  useEffect(() => {
    if (token && !eventoId && todos === null) dispatch(obtenerEventosAdmin(token))
  }, [dispatch, token, eventoId, todos])

  useEffect(() => {
    if (token && eventoId && !conOfertas) dispatch(obtenerOfertas({ eventoId, token }))
  }, [dispatch, token, eventoId, conOfertas])

  useEffect(() => {
    if (token && eventoId && !conImagenes) dispatch(obtenerImagenes({ eventoId, token }))
  }, [dispatch, token, eventoId, conImagenes])

  useEffect(() => {
    if (token && !locacionesCargadas) dispatch(obtenerLocaciones())
  }, [dispatch, token, locacionesCargadas])

  useEffect(() => {
    if (token && !categoriasCargadas) dispatch(obtenerCategorias())
  }, [dispatch, token, categoriasCargadas])

  if (!esAdmin) {
    return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }
  const falloCarga = (!evento && todos === null && errorAdmin) || (!locacionesCargadas && errorLocaciones) || (!categoriasCargadas && errorCategorias)
  if (falloCarga) {
    return <Aviso mensaje={falloCarga} boton="Volver" to="/admin" />
  }
  if (!evento && todos !== null) {
    return <Aviso mensaje="No encontramos este evento." boton="Volver" to="/admin" />
  }
  if (!evento || !conOfertas || !conImagenes || !locacionesCargadas || !categoriasCargadas) {
    return <main className="pagina admin"><p className="admin__cargando" role="status">Cargando evento…</p></main>
  }
  return <EdicionEvento evento={evento} locaciones={locaciones} categorias={categorias} token={token} />
}
