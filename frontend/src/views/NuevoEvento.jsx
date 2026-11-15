import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import BarraAcciones from '../components/BarraAcciones.jsx'
import Boton from '../components/Boton.jsx'
import FormularioEvento from '../components/FormularioEvento.jsx'
import PanelEntradas from '../components/PanelEntradas.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { obtenerCategorias } from '../redux/categoriasSlice'
import { crearEvento } from '../redux/eventosSlice'
import { obtenerLocaciones } from '../redux/locacionesSlice'
import { formularioAEvento, formularioVacio, validarEvento } from '../utils/formEvento.js'

// Pantalla "/admin/nuevo": el mismo formulario que editar, pero vacío. Al crear vuelve a la lista. Solo ADMIN.
export default function NuevoEvento() {
  const { sesion } = useSelector((state) => state.usuario)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items: locaciones, error: errorLocaciones, cargado: locacionesCargadas } = useSelector((state) => state.locaciones)
  const { items: categorias, error: errorCategorias, cargado: categoriasCargadas } = useSelector((state) => state.categorias)
  const [datos, setDatos] = useState(formularioVacio)
  const [aviso, setAviso] = useState('')
  const esAdmin = sesion?.rol === 'ADMIN'
  const listo = locacionesCargadas && categoriasCargadas
  const falloCarga = (!locacionesCargadas && errorLocaciones) || (!categoriasCargadas && errorCategorias)

  // Los lugares y las categorías se piden solo si todavía no están en el store
  useEffect(() => {
    if (esAdmin && !locacionesCargadas) dispatch(obtenerLocaciones())
  }, [dispatch, esAdmin, locacionesCargadas])

  useEffect(() => {
    if (esAdmin && !categoriasCargadas) dispatch(obtenerCategorias())
  }, [dispatch, esAdmin, categoriasCargadas])

  if (!esAdmin) {
    return <AvisoAcceso usuario={sesion} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso('')
  }

  const reintentar = () => {
    if (!locacionesCargadas) dispatch(obtenerLocaciones())
    if (!categoriasCargadas) dispatch(obtenerCategorias())
  }

  // Se despacha y se vuelve a la lista: el evento aparece ahí cuando llega, y si el back lo rechaza la lista muestra el error
  const guardar = () => {
    const problema = validarEvento(datos, { locaciones, categorias })
    if (problema) {
      setAviso(problema)
      return
    }
    dispatch(crearEvento({ token: sesion.token, ...formularioAEvento(datos, { locaciones, categorias }) }))
    navigate('/admin')
  }

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar eventos', ruta: '/admin' }, { texto: 'Nuevo evento' }]}
        titulo="Nuevo"
        resaltado="evento"
      />
      <div className="admin__dos-columnas">
        <div className="admin__columna">
          {listo ? (
            <FormularioEvento datos={datos} onCambiar={cambiar} locaciones={locaciones} categorias={categorias} />
          ) : falloCarga ? (
            <div role="alert">
              <p className="admin__aviso admin__aviso--error">{falloCarga}</p>
              <Boton onClick={reintentar}>Reintentar</Boton>
            </div>
          ) : (
            <p className="admin__cargando" role="status">Cargando…</p>
          )}
          <p className="fotos-admin__nota">Las fotos se suben después de crear el evento, entrando a editarlo desde la lista.</p>
        </div>
        <PanelEntradas />
      </div>
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
      <BarraAcciones textoGuardar="Crear evento" ocupado={!listo} onGuardar={guardar} />
    </main>
  )
}
