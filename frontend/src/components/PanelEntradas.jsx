import { useEffect, useState } from 'react'
import Boton from './Boton.jsx'
import EditorEntrada from './EditorEntrada.jsx'
import ResumenOferta from './ResumenOferta.jsx'
import { obtenerTiposEntrada } from '../utils/apiAdmin.js'
import { admiteEntradas } from '../utils/formOferta.js'

// Panel lateral con las entradas del evento: se ven, se agregan, se editan y se quitan. La lista se acomoda con lo que
// responde el back en cada alta, cambio o baja. Sin "evento" (se está creando) todavía no se pueden cargar entradas.
export default function PanelEntradas({ evento, token }) {
  const [ofertas, setOfertas] = useState(evento?.ofertas || [])
  const [tipos, setTipos] = useState([])
  const [editor, setEditor] = useState(null) // null = cerrado; si no, { oferta } (con oferta null es un alta)
  const [aviso, setAviso] = useState('')
  const hayEvento = Boolean(evento)

  useEffect(() => {
    if (!hayEvento) return undefined
    let activo = true
    obtenerTiposEntrada()
      .then((lista) => { if (activo) setTipos(lista) })
      .catch((fallo) => { if (activo) setAviso(fallo.message) })
    return () => { activo = false }
  }, [hayEvento])

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
  const usados = ofertas.map((oferta) => oferta.tipoEntradaId)
  const ofrecidos = tipos
    .filter((tipo) => tipo.activo !== false && !usados.includes(tipo.id))
    .map((tipo) => ({ ...tipo, id: String(tipo.id) }))

  const guardada = (oferta) => {
    setOfertas((actuales) => (actuales.some((otra) => otra.id === oferta.id)
      ? actuales.map((otra) => (otra.id === oferta.id ? oferta : otra))
      : [...actuales, oferta]))
    setEditor(null)
  }
  const tipoCreado = (tipo) => setTipos((actuales) => [...actuales, tipo].sort((a, b) => a.nombre.localeCompare(b.nombre)))

  return (
    <aside className="panel-entradas" aria-label="Entradas del evento">
      <h2>Entradas</h2>
      {evento.errorOfertas && (
        <p className="admin__aviso admin__aviso--error" role="alert">No pudimos cargar las entradas de este evento. Recargá la página.</p>
      )}
      {ofertas.length > 0 ? (
        <ul className="panel-entradas__lista">
          {ofertas.map((oferta) => (
            <ResumenOferta
              key={oferta.id}
              oferta={oferta}
              token={token}
              onEditar={() => { setAviso(''); setEditor({ oferta }) }}
              onQuitada={(id) => setOfertas((actuales) => actuales.filter((otra) => otra.id !== id))}
            />
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
          onGuardada={guardada}
          onTipoCreado={tipoCreado}
          onCancelar={() => setEditor(null)}
        />
      ) : (
        <>
          {admiteEntradas(evento) ? (
            <Boton variante="contorno" clase="boton--ancho" onClick={() => { setAviso(''); setEditor({ oferta: null }) }}>
              Agregar entrada
            </Boton>
          ) : (
            <p className="panel-entradas__aviso">Este evento ya terminó o fue cancelado: no se le pueden agregar entradas.</p>
          )}
          {aviso && <p className="admin__aviso admin__aviso--error" role="alert">{aviso}</p>}
        </>
      )}
    </aside>
  )
}
