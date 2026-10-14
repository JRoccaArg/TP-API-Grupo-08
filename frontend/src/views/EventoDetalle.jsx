import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import BarraCompra from '../components/BarraCompra.jsx'
import DatosEvento from '../components/DatosEvento.jsx'
import FlyerEvento from '../components/FlyerEvento.jsx'
import Footer from '../components/Footer.jsx'
import ListaEntradas from '../components/ListaEntradas.jsx'
import { eventos } from '../data/eventos.js'
import { ofertas } from '../data/ofertas.js'
import { fijarCantidad } from '../utils/carrito.js'

// Pantalla "/eventos/:id": datos del evento y elección de entradas en la misma página.
export default function EventoDetalle({ usuario, onAgregar }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [seleccion, setSeleccion] = useState([])
  const evento = eventos.find((e) => e.id === Number(id))

  if (!evento) return <Aviso mensaje="No encontramos este evento." boton="Ver fechas" to="/" />

  const cambiar = (ofertaId, cantidad) => setSeleccion(fijarCantidad(seleccion, ofertaId, cantidad))
  const comprar = () => {
    if (!usuario) return navigate('/login')
    onAgregar(seleccion)
    navigate('/carrito')
  }

  return (
    <>
      <main className="pagina evento">
        <FlyerEvento evento={evento} />
        <div className="evento__contenido">
          <DatosEvento evento={evento} />
          {evento.estado === 'ACTIVO' ? (
            <>
              <ListaEntradas
                ofertas={ofertas.filter((o) => o.eventoId === evento.id)}
                seleccion={seleccion}
                onCambiar={cambiar}
              />
              <BarraCompra seleccion={seleccion} hayUsuario={Boolean(usuario)} onComprar={comprar} />
            </>
          ) : (
            <p className="evento__finalizado">Esta edición ya finalizó.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
