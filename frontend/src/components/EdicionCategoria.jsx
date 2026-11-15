import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Boton from './Boton.jsx'
import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import { actualizarCategoria, crearCategoria } from '../redux/categoriasSlice'

const ESTADOS = [{ valor: 'true', texto: 'Activa' }, { valor: 'false', texto: 'Inactiva' }]

// Sin "categoria" crea una nueva; con "categoria" la edita. Despacha y cierra enseguida, como el EditPostForm de la profe
export default function EdicionCategoria({ categoria, token, onClose }) {
  const dispatch = useDispatch()
  const esNueva = !categoria
  const [datos, setDatos] = useState({ nombre: categoria?.nombre || '', activo: String(categoria?.activo !== false) })
  const [aviso, setAviso] = useState('')

  const cambiar = (campo) => (evento) => {
    setDatos({ ...datos, [campo]: evento.target.value })
    setAviso('')
  }

  const guardar = () => {
    if (!datos.nombre.trim()) {
      setAviso('Escribí el nombre de la categoría.')
      return
    }
    if (esNueva) {
      dispatch(crearCategoria({ token, nombre: datos.nombre.trim(), activo: true }))
    } else {
      dispatch(actualizarCategoria({ token, id: categoria.id, nombre: datos.nombre.trim(), activo: datos.activo === 'true' }))
    }
    onClose()
  }

  return (
    <>
      {esNueva && <p className="admin__seccion">NUEVA CATEGORÍA</p>}
      <div className="form-tipo">
        <CampoLinea etiqueta="NOMBRE" nombre="categoria-nombre" valor={datos.nombre} onChange={cambiar('nombre')} placeholder="Fiesta, Recital, After…" />
        {!esNueva && <CampoSelect etiqueta="ESTADO" nombre="categoria-activo" opciones={ESTADOS} valor={datos.activo} onChange={cambiar('activo')} />}
      </div>
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
      <div className="nuevo-tipo__acciones">
        <Boton variante="contorno" clase="boton--chico" onClick={onClose}>
          Cancelar
        </Boton>
        <Boton clase="boton--chico" onClick={guardar}>
          {esNueva ? 'Crear categoría' : 'Guardar'}
        </Boton>
      </div>
    </>
  )
}
