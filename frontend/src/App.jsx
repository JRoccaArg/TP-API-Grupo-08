import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Aviso from './components/Aviso.jsx'
import Navbar from './components/Navbar.jsx'
import Carrito from './views/Carrito.jsx'
import CompraConfirmada from './views/CompraConfirmada.jsx'
import EditarEvento from './views/EditarEvento.jsx'
import EditarLocacion from './views/EditarLocacion.jsx'
import EventoDetalle from './views/EventoDetalle.jsx'
import GestionarEventos from './views/GestionarEventos.jsx'
import GestionarLocaciones from './views/GestionarLocaciones.jsx'
import GestionarTiposEntrada from './views/GestionarTiposEntrada.jsx'
import Inicio from './views/Inicio.jsx'
import Login from './views/Login.jsx'
import MisEntradas from './views/MisEntradas.jsx'
import NuevoEvento from './views/NuevoEvento.jsx'
import NuevaLocacion from './views/NuevaLocacion.jsx'
import Pago from './views/Pago.jsx'
import Registro from './views/Registro.jsx'
import { entradasCompradas } from './data/entradasCompradas.js'
import { agregarAlCarrito, carritoVacio, fijarEnCarrito, pasarAPago } from './utils/carrito.js'
import { crearCompra } from './utils/compras.js'
import { borrarSesion, guardarSesion, leerSesion } from './utils/sesion.js'

const SIN_NAVBAR = ['/login', '/registro']

// App es el "controlador": guarda la sesión, el carrito y las compras, y se los pasa por props a quien los necesita.
// La sesión arranca con lo que haya en localStorage (si hay una vigente), así sobrevive a recargar la página.
export default function App() {
  const [usuario, setUsuario] = useState(leerSesion)
  const [carrito, setCarrito] = useState(carritoVacio)
  const [vencido, setVencido] = useState(false)
  const [compra, setCompra] = useState(null)
  const [entradas, setEntradas] = useState(entradasCompradas)
  const { pathname } = useLocation()

  // Llegada la hora de vencimiento se libera el carrito, esté la persona en la pantalla que esté.
  useEffect(() => {
    if (!carrito.vencimiento) return undefined
    const temporizador = setTimeout(() => {
      setCarrito(carritoVacio)
      setVencido(true)
    }, Math.max(0, carrito.vencimiento - Date.now()))
    return () => clearTimeout(temporizador)
  }, [carrito.vencimiento])

  // Login y registro llaman a esto con la sesión que devolvió el backend ({ token, email, nombre, rol }).
  const ingresar = (sesion) => {
    guardarSesion(sesion)
    setUsuario(sesion)
  }
  const salir = () => {
    borrarSesion()
    setUsuario(null)
    setCarrito(carritoVacio)
    setVencido(false)
    setCompra(null)
    setEntradas(entradasCompradas)
  }
  const agregar = (items) => {
    setCarrito(agregarAlCarrito(carrito, items))
    setVencido(false)
  }
  const cambiar = (ofertaId, cantidad) => setCarrito(fijarEnCarrito(carrito, ofertaId, cantidad))
  const vaciar = () => setCarrito(carritoVacio)
  // "Ir a pagar": el carrito pasa a EN_PAGO y arranca el reloj de pago. Con el backend: POST /carritos/activo/iniciar-pago.
  const iniciarPago = () => setCarrito(pasarAPago(carrito))
  // Compra simulada: emite las entradas y vacía el carrito. Con el backend esto es POST /compras.
  const pagar = (lineas) => {
    const nueva = crearCompra(lineas, compra ? compra.numero + 1 : 128, entradas.length + 1)
    setCompra(nueva)
    setEntradas([...nueva.entradas, ...entradas])
    setCarrito(carritoVacio)
  }

  return (
    <>
      {!SIN_NAVBAR.includes(pathname) && <Navbar usuario={usuario} carrito={carrito} onSalir={salir} onIrAPagar={iniciarPago} />}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/eventos/:id" element={<EventoDetalle usuario={usuario} onAgregar={agregar} />} />
        <Route
          path="/carrito"
          element={
            <Carrito
              usuario={usuario}
              carrito={carrito}
              vencido={vencido}
              onCambiar={cambiar}
              onVaciar={vaciar}
              onIrAPagar={iniciarPago}
            />
          }
        />
        <Route path="/pago" element={<Pago usuario={usuario} carrito={carrito} vencido={vencido} onPagar={pagar} />} />
        <Route path="/compra-confirmada" element={<CompraConfirmada usuario={usuario} compra={compra} />} />
        <Route path="/mis-entradas" element={<MisEntradas usuario={usuario} entradas={entradas} />} />
        <Route path="/login" element={<Login onIngresar={ingresar} />} />
        <Route path="/registro" element={<Registro onIngresar={ingresar} />} />
        <Route path="/admin" element={<GestionarEventos usuario={usuario} />} />
        <Route path="/admin/nuevo" element={<NuevoEvento usuario={usuario} />} />
        <Route path="/admin/locaciones" element={<GestionarLocaciones usuario={usuario} />} />
        <Route path="/admin/tipos-entrada" element={<GestionarTiposEntrada usuario={usuario} />} />
        <Route path="/admin/locaciones/nueva" element={<NuevaLocacion usuario={usuario} />} />
        <Route path="/admin/locaciones/:id" element={<EditarLocacion usuario={usuario} />} />
        <Route path="/admin/:id" element={<EditarEvento usuario={usuario} />} />
        <Route path="*" element={<Aviso mensaje="Esta página no existe." boton="Ir al inicio" to="/" />} />
      </Routes>
    </>
  )
}
