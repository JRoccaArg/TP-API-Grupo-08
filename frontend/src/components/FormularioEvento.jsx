import { useDispatch, useSelector } from 'react-redux'
import CampoElegirOCrear from './CampoElegirOCrear.jsx'
import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import { estadosEvento } from '../data/catalogos.js'
import { crearCategoria } from '../redux/categoriasSlice'
import { crearLocacion } from '../redux/locacionesSlice'
import { opcionesDeEstados } from '../utils/opciones.js'

// Datos del evento, con los campos que pide el back. Muestra "datos" y avisa cada cambio con onCambiar(campo, valor).
// El lugar y la categoría se eligen de una lista; si no están, cada uno tiene su botón «Crear», que despacha su alta (un pedido).
export default function FormularioEvento({ datos, onCambiar, locaciones, categorias, token }) {
  const dispatch = useDispatch()
  const { error: errorCategorias } = useSelector((state) => state.categorias)
  const { error: errorLocaciones } = useSelector((state) => state.locaciones)
  const cambiar = (campo) => (evento) => onCambiar(campo, evento.target.value)

  const crearCategoriaNueva = () => {
    dispatch(crearCategoria({ token, nombre: datos.categoria.trim(), activo: true }))
  }

  const crearLugarNuevo = () => {
    dispatch(crearLocacion({ token, nombre: datos.lugar.trim(), direccion: datos.direccion.trim() }))
  }

  return (
    <form className="form-evento" onSubmit={(e) => e.preventDefault()}>
      <p className="admin__seccion">DATOS DEL EVENTO</p>
      <CampoLinea etiqueta="TÍTULO" nombre="titulo" valor={datos.titulo} onChange={cambiar('titulo')} placeholder="Nombre del evento" />
      <CampoLinea
        etiqueta="DESCRIPCIÓN"
        nombre="descripcion"
        valor={datos.descripcion}
        onChange={cambiar('descripcion')}
        placeholder="Contá de qué se trata la noche"
      />
      <div className="form-evento__doble">
        <CampoLinea etiqueta="INICIO" nombre="inicio" tipo="datetime-local" valor={datos.inicio} onChange={cambiar('inicio')} />
        <CampoLinea etiqueta="FIN" nombre="fin" tipo="datetime-local" valor={datos.fin} onChange={cambiar('fin')} />
        <CampoSelect etiqueta="ESTADO" nombre="estado" opciones={opcionesDeEstados(estadosEvento)} valor={datos.estado} onChange={cambiar('estado')} />
        <CampoElegirOCrear
          etiqueta="CATEGORÍA"
          nombre="categoria"
          lista={categorias}
          valor={datos.categoria}
          textoVacio="Elegí una categoría"
          textoNuevo="+ Crear categoría nueva…"
          etiquetaNuevo="NOMBRE DE LA CATEGORÍA NUEVA"
          textoCrear="Crear categoría"
          puedeCrear={datos.categoria.trim() !== ''}
          error={errorCategorias}
          nota="Se crea en el momento con este botón y queda elegida. Después la podés editar en Administrar → Categorías."
          onCambiar={(valor) => onCambiar('categoria', valor)}
          onCrear={crearCategoriaNueva}
        />
      </div>
      <CampoElegirOCrear
        etiqueta="LUGAR"
        nombre="lugar"
        lista={locaciones}
        valor={datos.lugar}
        textoVacio="Elegí un lugar"
        textoNuevo="+ Crear lugar nuevo…"
        etiquetaNuevo="NOMBRE DEL LUGAR NUEVO"
        textoCrear="Crear lugar"
        puedeCrear={datos.lugar.trim() !== '' && datos.direccion.trim() !== ''}
        error={errorLocaciones}
        nota="Se crea en el momento con este botón y queda elegido. Después le podés sumar fotos en Administrar → Locaciones."
        onCambiar={(valor) => onCambiar('lugar', valor)}
        onCrear={crearLugarNuevo}
      >
        <CampoLinea etiqueta="DIRECCIÓN DEL LUGAR" nombre="direccion" valor={datos.direccion} onChange={cambiar('direccion')} placeholder="Calle y número" />
      </CampoElegirOCrear>
    </form>
  )
}
