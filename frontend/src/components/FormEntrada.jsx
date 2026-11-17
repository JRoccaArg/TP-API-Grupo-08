import Boton from './Boton.jsx'
import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import NuevoTipoEntrada from './NuevoTipoEntrada.jsx'
import { estadosOfertaEditables } from '../data/catalogos.js'
import { TIPO_NUEVO } from '../utils/formOferta.js'
import { opcionesDeCatalogo, opcionesDeEstados } from '../utils/opciones.js'

// No hay fechas de venta: se vende hasta que termina el evento y el estado (activa o pausada) la habilita o la frena.
// No guarda nada: muestra "datos", avisa los cambios con onCambiar({ campo: valor }) y al enviarse llama a onGuardar.
// Al editar el tipo no se cambia y "vendidas" evita bajar el cupo por debajo de lo vendido.
export default function FormEntrada({
  datos, edicion, tipoNombre, tipos, vendidas, aviso,
  onCambiar, onTipoCreado, onGuardar, onCancelar,
}) {
  const cambiar = (campo) => (e) => onCambiar({ [campo]: e.target.value })
  const opcionesTipo = [
    { valor: '', texto: 'Elegí un tipo' },
    ...opcionesDeCatalogo(tipos),
    { valor: TIPO_NUEVO, texto: '+ Crear un tipo nuevo…' },
  ]
  const estados = estadosOfertaEditables.includes(datos.estado) ? estadosOfertaEditables : [...estadosOfertaEditables, datos.estado]
  const tipo = edicion
    ? <p className="form-entrada__tipo">{tipoNombre}</p>
    : <CampoSelect etiqueta="TIPO" nombre="tipo" opciones={opcionesTipo} valor={datos.tipoEntradaId} onChange={cambiar('tipoEntradaId')} />

  // El tipo nuevo es otro formulario y no puede ir adentro de este: primero se crea y después vuelven los datos de la entrada
  if (datos.tipoEntradaId === TIPO_NUEVO) {
    return (
      <div className="form-entrada">
        <p className="admin__seccion">AGREGAR ENTRADA</p>
        <div className="form-entrada__grilla">
          <div className="form-entrada__completo">{tipo}</div>
          <div className="form-entrada__completo">
            <NuevoTipoEntrada onCreado={onTipoCreado} onCancelar={() => onCambiar({ tipoEntradaId: '' })} />
          </div>
        </div>
      </div>
    )
  }

  // noValidate: valida validarOferta, con sus mensajes (el navegador no dejaría un precio con decimales)
  return (
    <form className="form-entrada" onSubmit={onGuardar} noValidate>
      <p className="admin__seccion">{edicion ? 'EDITAR ENTRADA' : 'AGREGAR ENTRADA'}</p>
      <div className="form-entrada__grilla">
        <div className="form-entrada__completo">{tipo}</div>
        <CampoLinea etiqueta="PRECIO" nombre="precio" tipo="number" inputMode="decimal" valor={datos.precio} onChange={cambiar('precio')} placeholder="22000" />
        <CampoLinea etiqueta="DESCUENTO %" nombre="descuento" tipo="number" inputMode="decimal" valor={datos.descuento} onChange={cambiar('descuento')} placeholder="0" />
        <CampoLinea
          etiqueta="CANTIDAD"
          nombre="cantidad"
          tipo="number"
          inputMode="numeric"
          valor={datos.cantidad}
          onChange={cambiar('cantidad')}
          placeholder="150"
          extra={vendidas > 0 ? ` · ${vendidas} vendidas` : undefined}
        />
        <CampoSelect etiqueta="ESTADO" nombre="estado" opciones={opcionesDeEstados(estados)} valor={datos.estado} onChange={cambiar('estado')} />
      </div>
      {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
      <div className="form-entrada__acciones">
        <Boton variante="contorno" clase="boton--chico" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton tipo="submit" clase="boton--chico">
          {edicion ? 'Guardar entrada' : 'Agregar entrada'}
        </Boton>
      </div>
    </form>
  )
}
