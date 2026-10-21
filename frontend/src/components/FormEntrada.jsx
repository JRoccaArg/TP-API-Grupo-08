import Boton from './Boton.jsx'
import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import NuevoTipoEntrada from './NuevoTipoEntrada.jsx'
import { estadosOfertaEditables } from '../data/catalogos.js'
import { TIPO_NUEVO } from '../utils/formOferta.js'
import { opcionesDeCatalogo, opcionesDeEstados } from '../utils/opciones.js'

// No hay fechas de venta: se vende hasta que termina el evento y el estado (activa o pausada) la habilita o la frena.
// No guarda nada: muestra "datos" y avisa los cambios con onCambiar({ campo: valor }).
// Al editar el tipo no se cambia y "vendidas" evita bajar el cupo por debajo de lo vendido.
export default function FormEntrada({
  datos, edicion, tipoNombre, tipos, vendidas, token, ocupado, aviso,
  onCambiar, onTipoCreado, onGuardar, onCancelar,
}) {
  const cambiar = (campo) => (e) => onCambiar({ [campo]: e.target.value })
  const opcionesTipo = [
    { valor: '', texto: 'Elegí un tipo' },
    ...opcionesDeCatalogo(tipos),
    { valor: TIPO_NUEVO, texto: '+ Crear un tipo nuevo…' },
  ]
  const estados = estadosOfertaEditables.includes(datos.estado) ? estadosOfertaEditables : [...estadosOfertaEditables, datos.estado]

  return (
    <form className="form-entrada" onSubmit={(e) => e.preventDefault()}>
      <p className="admin__seccion">{edicion ? 'EDITAR ENTRADA' : 'AGREGAR ENTRADA'}</p>
      <div className="form-entrada__grilla">
        <div className="form-entrada__completo">
          {edicion ? (
            <p className="form-entrada__tipo">{tipoNombre}</p>
          ) : (
            <CampoSelect etiqueta="TIPO" nombre="tipo" opciones={opcionesTipo} valor={datos.tipoEntradaId} onChange={cambiar('tipoEntradaId')} />
          )}
        </div>
        {datos.tipoEntradaId === TIPO_NUEVO && (
          <div className="form-entrada__completo">
            <NuevoTipoEntrada token={token} onCreado={onTipoCreado} onCancelar={() => onCambiar({ tipoEntradaId: '' })} />
          </div>
        )}
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
        <Boton variante="contorno" clase="boton--chico" deshabilitado={ocupado} onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton clase="boton--chico" deshabilitado={ocupado} onClick={onGuardar}>
          {ocupado ? 'Guardando…' : edicion ? 'Guardar entrada' : 'Agregar entrada'}
        </Boton>
      </div>
    </form>
  )
}
