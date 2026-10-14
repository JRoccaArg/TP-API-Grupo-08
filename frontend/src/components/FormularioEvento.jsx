import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import SubidaFlyer from './SubidaFlyer.jsx'
import { categorias, estadosEvento, locaciones } from '../data/catalogos.js'
import { paraInput } from '../utils/fechas.js'
import { opcionesDeCatalogo, opcionesDeEstados } from '../utils/opciones.js'

// Formulario de datos del evento. Con "evento" sirve para editar; sin "evento", para crear uno nuevo.
// Por ahora es solo visual: no guarda nada.
export default function FormularioEvento({ evento }) {
  return (
    <form className="form-evento" onSubmit={(e) => e.preventDefault()}>
      <p className="admin__seccion">DATOS DEL EVENTO</p>
      <CampoLinea etiqueta="TÍTULO" nombre="titulo" valorInicial={evento?.titulo} placeholder="Nombre del evento" />
      <CampoLinea
        etiqueta="DESCRIPCIÓN"
        nombre="descripcion"
        valorInicial={evento?.descripcion}
        placeholder="Contá de qué se trata la noche"
      />
      <div className="form-evento__doble">
        <CampoLinea etiqueta="INICIO" nombre="inicio" tipo="datetime-local"
          valorInicial={evento && paraInput(evento.fechaHoraInicio)} />
        <CampoLinea etiqueta="FIN" nombre="fin" tipo="datetime-local"
          valorInicial={evento && paraInput(evento.fechaHoraFin)} />
        <CampoSelect etiqueta="ESTADO" nombre="estado" opciones={opcionesDeEstados(estadosEvento)}
          valorInicial={evento ? evento.estado : 'BORRADOR'} />
        <CampoSelect etiqueta="CATEGORÍA" nombre="categoria" opciones={opcionesDeCatalogo(categorias)}
          valorInicial={evento?.categoriaId} />
      </div>
      <CampoSelect etiqueta="LUGAR" nombre="locacion" opciones={opcionesDeCatalogo(locaciones)}
        valorInicial={evento?.locacionId} />
      <SubidaFlyer flyer={evento?.flyer} />
    </form>
  )
}
