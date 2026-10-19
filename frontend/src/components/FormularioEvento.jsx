import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import { estadosEvento } from '../data/catalogos.js'
import { esNuevo } from '../utils/formEvento.js'
import { opcionesDeEstados } from '../utils/opciones.js'

// Formulario de datos del evento, con los campos que pide el backend. No guarda nada por sí solo:
// muestra "datos" y avisa cada cambio con onCambiar(campo, valor); quien lo usa decide cuándo guardar.
// El lugar y la categoría se escriben: se sugieren los que ya existen y, si el nombre es nuevo, se crea al guardar.
export default function FormularioEvento({ datos, onCambiar, locaciones, categorias }) {
  const cambiar = (campo) => (evento) => onCambiar(campo, evento.target.value)
  const lugarNuevo = esNuevo(locaciones, datos.lugar)
  const categoriaNueva = esNuevo(categorias, datos.categoria)

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
        <CampoLinea
          etiqueta="CATEGORÍA"
          nombre="categoria"
          valor={datos.categoria}
          onChange={cambiar('categoria')}
          placeholder="Escribí o elegí una"
          sugerencias={categorias.filter((categoria) => categoria.activo !== false).map((categoria) => categoria.nombre)}
        />
      </div>
      {categoriaNueva && (
        <p className="form-evento__nota">Categoría nueva: se crea al guardar el evento. Después la podés editar en Administrar → Categorías.</p>
      )}
      <CampoLinea
        etiqueta="LUGAR"
        nombre="lugar"
        valor={datos.lugar}
        onChange={cambiar('lugar')}
        placeholder="Escribí o elegí uno"
        sugerencias={locaciones.map((locacion) => locacion.nombre)}
      />
      {lugarNuevo && (
        <>
          <p className="form-evento__nota">Lugar nuevo: se crea al guardar el evento. Después le podés sumar fotos en Administrar → Locaciones.</p>
          <CampoLinea etiqueta="DIRECCIÓN DEL LUGAR" nombre="direccion" valor={datos.direccion} onChange={cambiar('direccion')} placeholder="Calle y número" />
        </>
      )}
    </form>
  )
}
