import { useState } from 'react'
import Boton from './Boton.jsx'
import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import { actualizarCategoria, crearCategoria } from '../utils/apiCategorias.js'

const ESTADOS = [{ valor: 'true', texto: 'Activa' }, { valor: 'false', texto: 'Inactiva' }]

// Sin "categoria" crea una nueva; con "categoria" la edita (nombre y si está activa). Avisa con onGuardado(categoria)
export default function EdicionCategoria({ categoria, token, onGuardado, onCancelar }) {
  const esNueva = !categoria
  const [datos, setDatos] = useState({ nombre: categoria?.nombre || '', activo: String(categoria?.activo !== false) })
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const cambiar = (campo) => (evento) => {
    setDatos({ ...datos, [campo]: evento.target.value })
    setAviso('')
  }

  const guardar = () => {
    if (!datos.nombre.trim()) {
      setAviso('Escribí el nombre de la categoría.')
      return
    }
    setOcupado(true)
    const pedido = esNueva ? crearCategoria(token, datos) : actualizarCategoria(token, categoria.id, datos)
    pedido.then(onGuardado).catch((fallo) => {
      setAviso(fallo.estado === 409 ? 'Ya existe una categoría con ese nombre.' : fallo.message)
      setOcupado(false)
    })
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
        <Boton variante="contorno" clase="boton--chico" deshabilitado={ocupado} onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton clase="boton--chico" deshabilitado={ocupado} onClick={guardar}>
          {ocupado ? 'Guardando…' : esNueva ? 'Crear categoría' : 'Guardar'}
        </Boton>
      </div>
    </>
  )
}
