import { useState } from 'react'
import Boton from './Boton.jsx'
import CampoLinea from './CampoLinea.jsx'
import CampoSelect from './CampoSelect.jsx'
import { buscarPorNombre } from '../utils/formEvento.js'

const NUEVO = '__nuevo__'

// Lista desplegable con lo que ya existe y, al final, una opción para crear uno nuevo: aparece el campo para el nombre
// (y lo que venga en "children", por ejemplo la dirección) con su botón para crearlo. "valor" es el nombre elegido o escrito.
// No se espera la respuesta: cuando lo creado llega al store, ese nombre ya está en la lista y queda elegido solo.
export default function CampoElegirOCrear({
  etiqueta, nombre, lista, valor, textoVacio, textoNuevo, etiquetaNuevo, textoCrear, puedeCrear, error, nota, onCambiar, onCrear, children,
}) {
  const [creando, setCreando] = useState(false)
  const [pidioCrear, setPidioCrear] = useState(false)
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
    setPidioCrear(false)
    onCambiar(elegido === NUEVO ? '' : elegido)
  }

  const escribir = (evento) => {
    setPidioCrear(false)
    onCambiar(evento.target.value)
  }

  const crear = () => {
    onCrear()
    setCreando(false)
    setPidioCrear(true)
  }

  return (
    <div className="campo-crear">
      <CampoSelect etiqueta={etiqueta} nombre={nombre} opciones={opciones} valor={nuevo ? NUEVO : existente?.nombre ?? ''} onChange={elegir} />
      {nuevo && (
        <>
          <CampoLinea etiqueta={etiquetaNuevo} nombre={`${nombre}-nuevo`} valor={valor} onChange={escribir} />
          {children}
          <Boton variante="contorno" clase="boton--chico campo-crear__boton" deshabilitado={!puedeCrear} onClick={crear}>
            {textoCrear}
          </Boton>
          {/* Solo el error de lo que se pidió crear acá, no uno viejo de otra pantalla */}
          {pidioCrear && error && <p className="admin__aviso admin__aviso--error" role="alert">{error}</p>}
          <p className="form-evento__nota">{nota}</p>
        </>
      )}
    </div>
  )
}
