import CampoElegirOCrear from './CampoElegirOCrear.jsx'
import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import { estadosEvento } from '../data/catalogos.js'
import { opcionesDeEstados } from '../utils/opciones.js'

// Datos del evento, con los campos que pide el back. No guarda nada: muestra "datos" y avisa cada cambio con onCambiar(campo, valor).
// El lugar y la categoría se eligen de una lista; con "crear nuevo" se escribe el nombre y se crea al guardar el evento.
export default function FormularioEvento({ datos, onCambiar, locaciones, categorias }) {
  const cambiar = (campo) => (evento) => onCambiar(campo, evento.target.value)

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
          onCambiar={(valor) => onCambiar('categoria', valor)}
        >
          <p className="form-evento__nota">Se crea al guardar el evento. Después la podés editar en Administrar → Categorías.</p>
        </CampoElegirOCrear>
      </div>
      <CampoElegirOCrear
        etiqueta="LUGAR"
        nombre="lugar"
        lista={locaciones}
        valor={datos.lugar}
        textoVacio="Elegí un lugar"
        textoNuevo="+ Crear lugar nuevo…"
        etiquetaNuevo="NOMBRE DEL LUGAR NUEVO"
        onCambiar={(valor) => onCambiar('lugar', valor)}
      >
        <p className="form-evento__nota">Se crea al guardar el evento. Después le podés sumar fotos en Administrar → Locaciones.</p>
        <CampoLinea etiqueta="DIRECCIÓN DEL LUGAR" nombre="direccion" valor={datos.direccion} onChange={cambiar('direccion')} placeholder="Calle y número" />
      </CampoElegirOCrear>
    </form>
  )
}
