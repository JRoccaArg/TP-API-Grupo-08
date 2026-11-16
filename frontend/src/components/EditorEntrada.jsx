import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormEntrada from './FormEntrada.jsx'
import { actualizarOferta, crearOferta } from '../redux/eventosSlice'
import { buscarPorNombre } from '../utils/formEvento.js'
import { formularioAOferta, ofertaAFormulario, ofertaVacia, validarOferta, ventaDelEvento, vendidas } from '../utils/formOferta.js'

// Alta o edición de una entrada del evento ("oferta" es la que se edita; sin ella es un alta). Despacha y cierra enseguida.
export default function EditorEntrada({ evento, oferta, tipos, onClose }) {
  const { sesion } = useSelector((state) => state.usuario)
  const dispatch = useDispatch()
  const [datos, setDatos] = useState(oferta ? ofertaAFormulario(oferta) : ofertaVacia)
  const [tipoCreado, setTipoCreado] = useState('')
  const [aviso, setAviso] = useState('')
  // Un tipo creado acá queda elegido cuando llega al store: se lo busca por el nombre que se escribió
  const elegido = tipoCreado ? buscarPorNombre(tipos, tipoCreado) : null
  const tipoEntradaId = elegido ? String(elegido.id) : datos.tipoEntradaId

  const cambiar = (cambios) => {
    if (cambios.tipoEntradaId !== undefined) setTipoCreado('')
    setDatos({ ...datos, ...cambios })
    setAviso('')
  }

  const creado = (nombre) => {
    setTipoCreado(nombre)
    setDatos({ ...datos, tipoEntradaId: '' })
  }

  const guardar = () => {
    const problema = validarOferta({ ...datos, tipoEntradaId }, { edicion: Boolean(oferta), vendidas: oferta ? vendidas(oferta) : 0 })
    if (problema) {
      setAviso(problema)
      return
    }
    if (oferta) {
      // El estado va solo si lo cambió el admin (AGOTADO y FINALIZADO los calcula el back).
      // El cierre de la venta se vuelve a alinear con el fin del evento; el inicio queda como estaba.
      dispatch(actualizarOferta({
        token: sesion.token,
        eventoId: evento.id,
        id: oferta.id,
        ...formularioAOferta(datos),
        fechaFinVenta: ventaDelEvento(evento).fechaFinVenta,
        estado: datos.estado !== oferta.estado ? datos.estado : undefined,
      }))
    } else {
      dispatch(crearOferta({
        token: sesion.token,
        eventoId: evento.id,
        tipoEntradaId: Number(tipoEntradaId),
        ...formularioAOferta(datos),
        ...ventaDelEvento(evento),
        estado: datos.estado,
      }))
    }
    onClose()
  }

  return (
    <FormEntrada
      datos={{ ...datos, tipoEntradaId }}
      edicion={Boolean(oferta)}
      tipoNombre={oferta?.tipoEntradaNombre}
      tipos={tipos}
      vendidas={oferta ? vendidas(oferta) : 0}
      aviso={aviso}
      onCambiar={cambiar}
      onTipoCreado={creado}
      onGuardar={guardar}
      onCancelar={onClose}
    />
  )
}
