import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BarraAcciones from './BarraAcciones.jsx'
import FormularioEvento from './FormularioEvento.jsx'
import ImagenesEvento from './ImagenesEvento.jsx'
import PanelEntradas from './PanelEntradas.jsx'
import TituloAdmin from './TituloAdmin.jsx'
import { actualizarEvento, alinearVentas, eliminarEvento } from '../utils/apiAdmin.js'
import { eventoAFormulario, validarEvento } from '../utils/formEvento.js'
import { guardarEvento } from '../utils/guardarEvento.js'

// Edición de un evento ya cargado: sus datos, sus fotos y sus entradas. Al guardar los datos vuelve al resumen del evento.
export default function EdicionEvento({ evento, locaciones, categorias, token }) {
  const navigate = useNavigate()
  const opciones = { locaciones, categorias }
  const [datos, setDatos] = useState(eventoAFormulario(evento))
  const [aviso, setAviso] = useState({ tipo: '', texto: '' })
  const [ocupado, setOcupado] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setAviso({ tipo: '', texto: '' })
  }

  const guardar = () => {
    const problema = validarEvento(datos, opciones)
    if (problema) {
      setAviso({ tipo: 'error', texto: problema })
      return
    }
    setOcupado(true)
    setAviso({ tipo: '', texto: '' })
    guardarEvento(token, datos, opciones, (conIds) => actualizarEvento(token, evento.id, conIds))
      // Si cambió el fin del evento, la venta de sus entradas cierra en el nuevo fin (por ejemplo, al reprogramarlo).
      .then(({ evento: actualizado }) => {
        const cambioElFin = datos.fin !== eventoAFormulario(evento).fin
        return (cambioElFin ? alinearVentas(token, evento.id, datos.fin) : Promise.resolve([]))
          .then((movidas) => ({ actualizado, movidas }))
      })
      // Al guardar se vuelve al resumen del evento, que muestra la confirmación (así se nota que se guardó).
      .then(({ actualizado, movidas }) => navigate(`/admin/${evento.id}`, {
        state: {
          aviso: `Guardaste los cambios de "${actualizado.titulo}".${movidas.length ? ` La venta de ${movidas.length} ${movidas.length === 1 ? 'entrada' : 'entradas'} ahora cierra cuando termina el evento.` : ''}`,
        },
      }))
      .catch((fallo) => {
        setAviso({ tipo: 'error', texto: fallo.message })
        setOcupado(false)
      })
  }

  // Eliminar pide una segunda confirmación: el primer clic cambia el texto del botón, el segundo borra.
  const eliminar = () => {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    setOcupado(true)
    eliminarEvento(token, evento.id)
      .then(() => navigate('/admin', { state: { aviso: `Eliminaste el evento "${evento.titulo}".` } }))
      .catch((fallo) => {
        setConfirmando(false)
        setOcupado(false)
        setAviso({ tipo: 'error', texto: fallo.message })
      })
  }

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar eventos', ruta: '/admin' }, { texto: evento.titulo, ruta: `/admin/${evento.id}` }, { texto: 'Editar' }]}
        titulo="Editar"
        resaltado="evento"
      />
      <div className="admin__dos-columnas">
        <div className="admin__columna">
          <FormularioEvento datos={datos} onCambiar={cambiar} locaciones={opciones.locaciones} categorias={opciones.categorias} />
          <ImagenesEvento eventoId={evento.id} titulo={evento.titulo} token={token} inicial={evento.imagenes} />
        </div>
        <PanelEntradas evento={evento} token={token} />
      </div>
      {aviso.texto && <p className={`admin__aviso admin__aviso--${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>{aviso.texto}</p>}
      <BarraAcciones
        textoGuardar={ocupado ? 'Guardando…' : 'Guardar cambios'}
        textoEliminar={confirmando ? 'Confirmar: eliminar evento' : 'Eliminar evento'}
        ocupado={ocupado}
        onGuardar={guardar}
        onEliminar={eliminar}
      />
    </main>
  )
}
