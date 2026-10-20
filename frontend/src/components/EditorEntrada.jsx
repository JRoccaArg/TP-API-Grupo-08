import { useState } from 'react'
import FormEntrada from './FormEntrada.jsx'
import { actualizarOferta, crearOferta } from '../utils/apiAdmin.js'
import { ofertaAFormulario, ofertaVacia, validarOferta, vendidas } from '../utils/formOferta.js'

// Alta o edición de una entrada del evento. Guarda en el back y avisa con onGuardada(entrada) lo que respondió.
// "oferta" es la entrada que se edita; sin ella es un alta.
export default function EditorEntrada({ evento, oferta, tipos, token, onGuardada, onTipoCreado, onCancelar }) {
  const [datos, setDatos] = useState(oferta ? ofertaAFormulario(oferta) : ofertaVacia)
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const cambiar = (cambios) => {
    setDatos({ ...datos, ...cambios })
    setAviso('')
  }
  const tipoCreado = (tipo) => {
    onTipoCreado(tipo)
    cambiar({ tipoEntradaId: String(tipo.id) })
  }

  const guardar = () => {
    const problema = validarOferta(datos, { edicion: Boolean(oferta), vendidas: oferta ? vendidas(oferta) : 0 })
    if (problema) {
      setAviso(problema)
      return
    }
    setOcupado(true)
    const pedido = oferta
      ? actualizarOferta(token, oferta.id, datos, datos.estado !== oferta.estado, evento)
      : crearOferta(token, evento, datos)
    pedido.then(onGuardada).catch((fallo) => {
      setAviso(fallo.message)
      setOcupado(false)
    })
  }

  return (
    <FormEntrada
      datos={datos}
      edicion={Boolean(oferta)}
      tipoNombre={oferta?.tipoEntradaNombre}
      tipos={tipos}
      vendidas={oferta ? vendidas(oferta) : 0}
      token={token}
      ocupado={ocupado}
      aviso={aviso}
      onCambiar={cambiar}
      onTipoCreado={tipoCreado}
      onGuardar={guardar}
      onCancelar={onCancelar}
    />
  )
}
