import { Link } from 'react-router-dom'
import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import { estadosEvento } from '../data/catalogos.js'
import { opcionesDeCatalogo, opcionesDeEstados } from '../utils/opciones.js'

// Formulario de datos del evento, con los campos que pide el backend. No guarda nada por sí solo:
// muestra "datos" y avisa cada cambio con onCambiar(campo, valor); quien lo usa decide cuándo guardar.
export default function FormularioEvento({ datos, onCambiar, locaciones, categorias }) {
  const cambiar = (campo) => (evento) => onCambiar(campo, evento.target.value)
  const conPrimeraOpcion = (opciones) => [{ valor: '', texto: 'Elegí una opción' }, ...opciones]

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
        <CampoSelect
          etiqueta="CATEGORÍA"
          nombre="categoria"
          opciones={conPrimeraOpcion(opcionesDeCatalogo(categorias))}
          valor={datos.categoriaId}
          onChange={cambiar('categoriaId')}
        />
      </div>
      <CampoSelect
        etiqueta="LUGAR"
        nombre="locacion"
        opciones={conPrimeraOpcion(opcionesDeCatalogo(locaciones))}
        valor={datos.locacionId}
        onChange={cambiar('locacionId')}
      />
      <p className="form-evento__nota">
        ¿No aparece el lugar? <Link className="enlace-oro" to="/admin/locaciones/nueva">Creá la locación</Link> y volvé acá.
      </p>
    </form>
  )
}
