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

// Todas las rutas del sitio. No tiene estado: recibe de Sitio la sesión, el carrito y lo que se puede hacer con él.
export default function RutasSitio({ usuario, onIngresar, carrito, carga, vencido, eventos, acciones }) {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/eventos/:id" element={<EventoDetalle cargaCarrito={carga} usuario={usuario} onConfirmarSeleccion={acciones.agregar} />} />
      <Route
        path="/carrito"
        element={
          <Carrito
            usuario={usuario}
            carrito={carrito}
            carga={carga}
            vencido={vencido}
            eventos={eventos}
            onCambiar={acciones.cambiar}
            onVaciar={acciones.vaciar}
            onIrAPagar={acciones.irAPagar}
            onReintentar={acciones.reintentar}
          />
        }
      />
      <Route path="/pago" element={<Pago usuario={usuario} carrito={carrito} carga={carga} vencido={vencido} onPagar={acciones.pagar} />} />
      <Route path="/compra/:id" element={<CompraConfirmada usuario={usuario} />} />
      <Route path="/mis-entradas" element={<MisEntradas usuario={usuario} />} />
      <Route path="/mis-entradas/:eventoId" element={<MisEntradas usuario={usuario} />} />
      <Route path="/verificar/:codigo" element={<VerificarEntrada usuario={usuario} />} />
      <Route path="/login" element={<Login onIngresar={onIngresar} />} />
      <Route path="/registro" element={<Registro onIngresar={onIngresar} />} />
      <Route path="/admin/*" element={<RutasAdmin usuario={usuario} />} />
      <Route path="*" element={<Aviso mensaje="Esta página no existe." boton="Ir al inicio" to="/" />} />
    </Routes>
  )
}
