import { borrarSeleccionPendiente } from './utils/seleccionPendiente.js'
import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AvisoSesion from './components/AvisoSesion.jsx'
import Navbar from './components/Navbar.jsx'
import RutasSitio from './RutasSitio.jsx'
import { agregarVarios, cambiarCantidad, iniciarPago, obtenerCarrito, quitarItem, vaciarCarrito } from './utils/apiCarrito.js'
import { pagarCarrito } from './utils/apiCompras.js'
import { ErrorApi, obtenerEventosPorId } from './utils/apiEventos.js'
import { carritoVacio, idsDeEventos, vencimientoMs } from './utils/carrito.js'

const SIN_NAVBAR = ['/login', '/registro']

// Sitio es el "controlador" del carrito: guarda el que devuelve el back y se lo pasa por props a quien lo necesita.
// Cada acción pide al back y, con su respuesta, actualiza la pantalla (no se vuelve a pedir el carrito).
export default function Sitio({ usuario, sesionVencida, onIngresar, onSalir }) {
  const { pathname } = useLocation()
  const token = usuario?.rol === 'USER' ? usuario.token : null // solo el rol USER tiene carrito
  const [carrito, setCarrito] = useState(carritoVacio)
  const [cargadoPara, setCargadoPara] = useState(null) // el token con el que ya se pidió el carrito
  const [errorCarga, setErrorCarga] = useState('')
  const [vencido, setVencido] = useState(false)
  const [eventos, setEventos] = useState({}) // flyer, fecha y lugar de los eventos que hay en el carrito, por id
  const [reintento, setReintento] = useState(0)
  const [revision, setRevision] = useState(0)
  const venceEn = vencimientoMs(carrito)
  const carga = { cargando: Boolean(token) && cargadoPara !== token && !errorCarga, error: errorCarga }

  useEffect(() => {
    if (!token) return undefined
    let activo = true
    obtenerCarrito(token)
      .then((nuevo) => {
        if (!activo) return
        setCarrito(nuevo)
        setCargadoPara(token)
      })
      .catch((fallo) => { if (activo) setErrorCarga(fallo.message) })
    return () => { activo = false }
  }, [token, reintento])

  // De cada evento que hay en el carrito se piden una sola vez su flyer, su fecha y su lugar.
  useEffect(() => {
    const faltan = idsDeEventos(carrito).filter((id) => !(id in eventos))
    if (!faltan.length) return undefined
    let activo = true
    obtenerEventosPorId(faltan).then((nuevos) => { if (activo) setEventos((actuales) => ({ ...actuales, ...nuevos })) })
    return () => { activo = false }
  }, [carrito, eventos])

  // Llegada la hora de vencimiento se le pregunta al back: si reemplazó el carrito por uno nuevo, las entradas se liberaron.
  useEffect(() => {
    if (!token || venceEn === null) return undefined
    let activo = true
    const restante = venceEn - Date.now()
    const reloj = setTimeout(() => {
      obtenerCarrito(token)
        .then((nuevo) => {
          if (!activo) return
          setCarrito(nuevo)
          if (nuevo.id !== carrito.id) setVencido(true)
          else setRevision((actual) => actual + 1) // el back todavía lo da por vigente (reloj adelantado): se vuelve a mirar
        })
        .catch(() => {})
    }, restante > 0 ? restante : 30000)
    return () => { activo = false; clearTimeout(reloj) }
  }, [token, venceEn, revision, carrito.id])

  const aplicar = (pedido) => pedido.then((nuevo) => {
    setCarrito(nuevo)
    setVencido(false)
    return nuevo
  })
  // Un 404 puede significar que el tiempo se venció: se le pregunta al back cuál es el carrito que quedó.
  const controlar404 = (pedido) => pedido.catch((fallo) => {
    if (fallo.estado !== 404) throw fallo
    return obtenerCarrito(token).then((actual) => {
      setCarrito(actual)
      setVencido(actual.id !== carrito.id)
      throw fallo
    })
  })
  // El back agrega de a una entrada: si alguna falla, se avisa cuántas ya quedaron en el carrito.
  const agregar = useCallback((pedido) => {
    let agregados = 0
    return agregarVarios(token, pedido.items, (nuevo) => {
      setCargadoPara(token)
      setErrorCarga('')
      agregados += 1
      setCarrito(nuevo)
      setVencido(false)
    }).catch((fallo) => {
      const detalle = `Agregamos ${agregados} de ${pedido.items.length} al carrito, pero no se pudo seguir: ${fallo.message}`
      const error = new ErrorApi(agregados > 0 ? detalle : fallo.message, fallo.estado)
      error.agregados = agregados
      throw error
    })
  }, [token])
  const acciones = {
    agregar,
    cambiar: (itemId, cantidad) =>
      controlar404(aplicar(cantidad > 0 ? cambiarCantidad(token, itemId, cantidad) : quitarItem(token, itemId))),
    vaciar: () => controlar404(aplicar(vaciarCarrito(token))),
    irAPagar: () => controlar404(aplicar(iniciarPago(token))),
    pagar: () => controlar404(pagarCarrito(token).then((compra) => {
      setCarrito(carritoVacio)
      setVencido(false)
      return compra
    })),
    reintentar: () => {
      setErrorCarga('')
      setReintento((actual) => actual + 1)
    },
  }
  // Al salir, el carrito de esa persona no puede quedar a la vista de la siguiente.
  const salir = () => {
    borrarSeleccionPendiente()
    setCarrito(carritoVacio)
    setCargadoPara(null)
    setVencido(false)
    onSalir()
  }

  return (
    <>
      {!SIN_NAVBAR.includes(pathname) && (
        <Navbar usuario={usuario} carrito={carrito} eventos={eventos} onSalir={salir} onIrAPagar={acciones.irAPagar} />
      )}
      {sesionVencida && !SIN_NAVBAR.includes(pathname) && <AvisoSesion />}
      <RutasSitio
        usuario={usuario}
        onIngresar={onIngresar}
        carrito={carrito}
        carga={carga}
        vencido={vencido}
        eventos={eventos}
        acciones={acciones}
      />
    </>
  )
}
