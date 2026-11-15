import { Route, Routes } from 'react-router-dom'
import Aviso from './components/Aviso.jsx'
import RutasAdmin from './RutasAdmin.jsx'
import Carrito from './views/Carrito.jsx'
import CompraConfirmada from './views/CompraConfirmada.jsx'
import EventoDetalle from './views/EventoDetalle.jsx'
import Inicio from './views/Inicio.jsx'
import Login from './views/Login.jsx'
import MisEntradas from './views/MisEntradas.jsx'
import Pago from './views/Pago.jsx'
import Registro from './views/Registro.jsx'
import VerificarEntrada from './views/VerificarEntrada.jsx'

// Todas las rutas del sitio. No tiene estado ni props: cada pantalla lee del store lo que necesita, también la sesión.
export default function RutasSitio() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/eventos/:id" element={<EventoDetalle />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/pago" element={<Pago />} />
      <Route path="/compra/:id" element={<CompraConfirmada />} />
      <Route path="/mis-entradas" element={<MisEntradas />} />
      <Route path="/mis-entradas/:eventoId" element={<MisEntradas />} />
      <Route path="/verificar/:codigo" element={<VerificarEntrada />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/admin/*" element={<RutasAdmin />} />
      <Route path="*" element={<Aviso mensaje="Esta página no existe." boton="Ir al inicio" to="/" />} />
    </Routes>
  )
}
