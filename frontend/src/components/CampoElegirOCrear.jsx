import { useState } from 'react'
import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import { buscarPorNombre } from '../utils/formEvento.js'

const NUEVO = '__nuevo__'

// Lista desplegable con lo que ya existe y, al final, una opción para crear uno nuevo: en ese caso aparece el campo
// para escribir su nombre (y lo que pase como "children", por ejemplo la dirección). "valor" es el nombre elegido o escrito.
export default function CampoElegirOCrear({ etiqueta, nombre, lista, valor, textoVacio, textoNuevo, etiquetaNuevo, onCambiar, children }) {
  const [creando, setCreando] = useState(false)
  const existente = buscarPorNombre(lista, valor)
  const nuevo = creando || (valor.trim() !== '' && !existente)
  // Los inactivos no se ofrecen, salvo el que ya está elegido (para que no parezca vacío).
  const opciones = [
    { valor: '', texto: textoVacio },
    ...lista
      .filter((item) => item.activo !== false || item.nombre === existente?.nombre)
      .map((item) => ({ valor: item.nombre, texto: item.activo === false ? `${item.nombre} (inactiva)` : item.nombre })),
    { valor: NUEVO, texto: textoNuevo },
  ]

  const elegir = (evento) => {
    const elegido = evento.target.value
    setCreando(elegido === NUEVO)
    onCambiar(elegido === NUEVO ? '' : elegido)
  }

  return (
    <div className="campo-crear">
      <CampoSelect etiqueta={etiqueta} nombre={nombre} opciones={opciones} valor={nuevo ? NUEVO : existente?.nombre ?? ''} onChange={elegir} />
      {nuevo && (
        <>
          <CampoLinea etiqueta={etiquetaNuevo} nombre={`${nombre}-nuevo`} valor={valor} onChange={(evento) => onCambiar(evento.target.value)} />
          {children}
        </>
      )}
    </div>
  )
}
