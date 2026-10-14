import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Aviso from './components/Aviso.jsx'
import Navbar from './components/Navbar.jsx'
import Carrito from './views/Carrito.jsx'
import EditarEvento from './views/EditarEvento.jsx'
import EventoDetalle from './views/EventoDetalle.jsx'
import GestionarEventos from './views/GestionarEventos.jsx'
import Inicio from './views/Inicio.jsx'
import Login from './views/Login.jsx'
import MisEntradas from './views/MisEntradas.jsx'
import NuevoEvento from './views/NuevoEvento.jsx'
import Pago from './views/Pago.jsx'
import Registro from './views/Registro.jsx'
import { agregarAlCarrito, carritoVacio, fijarEnCarrito } from './utils/carrito.js'
import { crearUsuario } from './utils/usuarios.js'

const SIN_NAVBAR = ['/login', '/registro']

// App es el "controlador": guarda la sesión y el carrito, y se los pasa por props a quien los necesita.
export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [carrito, setCarrito] = useState(carritoVacio)
  const { pathname } = useLocation()

  const ingresar = (email, nombre) => {
    const nuevo = crearUsuario(email, nombre)
    setUsuario(nuevo)
    return nuevo
  }
  const salir = () => {
    setUsuario(null)
    setCarrito(carritoVacio)
  }
  const agregar = (items) => setCarrito(agregarAlCarrito(carrito, items))
  const cambiar = (ofertaId, cantidad) => setCarrito(fijarEnCarrito(carrito, ofertaId, cantidad))
  const vaciar = () => setCarrito(carritoVacio)

  return (
    <>
      {!SIN_NAVBAR.includes(pathname) && <Navbar usuario={usuario} carrito={carrito} onSalir={salir} />}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/eventos/:id" element={<EventoDetalle usuario={usuario} onAgregar={agregar} />} />
        <Route path="/carrito" element={<Carrito usuario={usuario} carrito={carrito} onCambiar={cambiar} onVaciar={vaciar} />} />
        <Route path="/pago" element={<Pago usuario={usuario} carrito={carrito} onPagar={vaciar} />} />
        <Route path="/mis-entradas" element={<MisEntradas usuario={usuario} />} />
        <Route path="/login" element={<Login onIngresar={ingresar} />} />
        <Route path="/registro" element={<Registro onIngresar={ingresar} />} />
        <Route path="/admin" element={<GestionarEventos usuario={usuario} />} />
        <Route path="/admin/nuevo" element={<NuevoEvento usuario={usuario} />} />
        <Route path="/admin/:id" element={<EditarEvento usuario={usuario} />} />
        <Route path="*" element={<Aviso mensaje="Esta página no existe." boton="Ir al inicio" to="/" />} />
      </Routes>
    </>
  )
}
