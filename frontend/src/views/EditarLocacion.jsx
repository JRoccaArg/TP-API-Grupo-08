import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import EdicionLocacion from '../components/EdicionLocacion.jsx'
import { obtenerFotosLocacion, obtenerLocaciones } from '../redux/locacionesSlice'

// Pantalla "/admin/locaciones/:id": busca la locación en el store (si hace falta pide la lista y sus fotos) y se la pasa a EdicionLocacion. Solo ADMIN.
export default function EditarLocacion({ usuario }) {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { items, error, cargado } = useSelector((state) => state.locaciones)
  const esAdmin = usuario?.rol === 'ADMIN'
  // El id de la URL es texto y el del back es número: se convierte para comparar con triple igual
  const locacion = items.find((item) => item.id === Number(id))
  const locacionId = locacion?.id
  const fotosPedidas = Boolean(locacion?.imagenes)

  useEffect(() => {
    if (esAdmin && !cargado) dispatch(obtenerLocaciones())
  }, [dispatch, esAdmin, cargado])

  // Las fotos se piden una sola vez: si ya vinieron desde la lista o el inicio, no se piden de nuevo
  useEffect(() => {
    if (locacionId && !fotosPedidas) dispatch(obtenerFotosLocacion(locacionId))
  }, [dispatch, locacionId, fotosPedidas])

  if (!esAdmin) {
    return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }
  if (!cargado && error) {
    return <Aviso mensaje={error} boton="Volver" to="/admin/locaciones" />
  }
  if (!cargado || (locacion && !fotosPedidas)) {
    return <main className="pagina admin"><p className="admin__cargando" role="status">Cargando locación…</p></main>
  }
  if (!locacion) {
    return <Aviso mensaje="No encontramos esta locación." boton="Volver" to="/admin/locaciones" />
  }
  return <EdicionLocacion locacion={locacion} token={usuario.token} />
}
