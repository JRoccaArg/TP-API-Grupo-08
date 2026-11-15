import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Boton from './Boton.jsx'
import EditorEntrada from './EditorEntrada.jsx'
import ResumenOferta from './ResumenOferta.jsx'
import { obtenerTiposEntrada } from '../redux/tiposEntradaSlice'
import { admiteEntradas } from '../utils/formOferta.js'

// Panel lateral con las entradas del evento (ver, agregar, editar, quitar). Lee las entradas del evento en el store.
// Sin "evento" (se está creando) todavía no se pueden cargar entradas.
export default function PanelEntradas({ evento, token }) {
  const dispatch = useDispatch()
  const { items: tipos, error: errorTipos, cargado: tiposCargados } = useSelector((state) => state.tiposEntrada)
  const [editor, setEditor] = useState(null) // null = cerrado; si no, { oferta } (con oferta null es un alta)
  const hayEvento = Boolean(evento)

  useEffect(() => {
    if (hayEvento && !tiposCargados) dispatch(obtenerTiposEntrada())
  }, [dispatch, hayEvento, tiposCargados])

  if (!evento) {
    return (
      <aside className="panel-entradas" aria-label="Entradas del evento">
        <h2>Entradas</h2>
        <p className="panel-entradas__aviso">
          Primero guardá el evento. Después vas a poder cargar sus entradas, con su precio, descuento y cupo.
        </p>
      </aside>
    )
  }

  // Los tipos que el evento ya tiene no se ofrecen de nuevo (el back no permite repetirlos); los inactivos tampoco.
  const usados = evento.ofertas.map((oferta) => oferta.tipoEntradaId)
  const ofrecidos = tipos.filter((tipo) => tipo.activo !== false && !usados.includes(tipo.id))

  return (
    <aside className="panel-entradas" aria-label="Entradas del evento">
      <h2>Entradas</h2>
      {evento.errorOfertas && (
        <p className="admin__aviso admin__aviso--error" role="alert">No pudimos cargar las entradas de este evento. Recargá la página.</p>
      )}
      {!tiposCargados && errorTipos && <p className="admin__aviso admin__aviso--error" role="alert">{errorTipos}</p>}
      {evento.ofertas.length > 0 ? (
        <ul className="panel-entradas__lista">
          {evento.ofertas.map((oferta) => (
            <ResumenOferta key={oferta.id} oferta={oferta} eventoId={evento.id} token={token} onEditar={() => setEditor({ oferta })} />
          ))}
        </ul>
      ) : (
        <p className="panel-entradas__aviso">Este evento todavía no tiene entradas.</p>
      )}
      {editor ? (
        <EditorEntrada
          key={editor.oferta?.id ?? 'nueva'}
          evento={evento}
          oferta={editor.oferta}
          tipos={ofrecidos}
          token={token}
          onClose={() => setEditor(null)}
        />
      ) : admiteEntradas(evento) ? (
        <Boton variante="contorno" clase="boton--ancho" onClick={() => setEditor({ oferta: null })}>
          Agregar entrada
        </Boton>
      ) : (
        <p className="panel-entradas__aviso">Este evento ya terminó o fue cancelado: no se le pueden agregar entradas.</p>
      )}
    </aside>
  )
}
