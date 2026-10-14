import Boton from './Boton.jsx'
import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import { estadosOferta, tiposEntrada } from '../data/catalogos.js'
import { opcionesDeCatalogo, opcionesDeEstados } from '../utils/opciones.js'

// Formulario para agregar un tipo de entrada a un evento. Solo visual, por ahora.
export default function FormEntrada() {
  return (
    <form className="form-entrada" onSubmit={(e) => e.preventDefault()}>
      <p className="admin__seccion">AGREGAR TIPO DE ENTRADA</p>
      <div className="form-entrada__grilla">
        <div className="form-entrada__completo">
          <CampoSelect etiqueta="TIPO" nombre="tipo" opciones={opcionesDeCatalogo(tiposEntrada)} />
        </div>
        <CampoLinea etiqueta="PRECIO" nombre="precio" tipo="number" placeholder="22000" />
        <CampoLinea etiqueta="DESCUENTO %" nombre="descuento" tipo="number" placeholder="0" />
        <CampoLinea etiqueta="CANTIDAD" nombre="cantidad" tipo="number" placeholder="150" />
        <CampoSelect etiqueta="ESTADO" nombre="estado" opciones={opcionesDeEstados(estadosOferta)} />
        <CampoLinea etiqueta="VENTA DESDE" nombre="desde" tipo="datetime-local" />
        <CampoLinea etiqueta="VENTA HASTA" nombre="hasta" tipo="datetime-local" />
      </div>
      <Boton tipo="submit" variante="contorno" clase="boton--ancho">
        Agregar entrada
      </Boton>
    </form>
  )
}
