import Boton from './Boton.jsx'
import DatosEvento from './DatosEvento.jsx'
import FlyerEvento from './FlyerEvento.jsx'
import Footer from './Footer.jsx'
import Icono from './Icono.jsx'
import ListaEntradas from './ListaEntradas.jsx'

const ESTADOS = {
  FINALIZADO: 'Esta edición ya finalizó.', CANCELADO: 'Este evento fue cancelado.',
  REPROGRAMADO: 'Este evento fue reprogramado. La venta no está habilitada.',
  BORRADOR: 'Vista previa: este evento es un borrador y todavía no lo ve el público.',
}

// La página de un evento ya cargado. Las entradas y el agregado al carrito los maneja ListaEntradas con el store
export default function ContenidoEvento({ evento, volverA, onReintentar }) {
  const estado = evento.estado?.toUpperCase()
  return (
    <div className="detalle-catalogo">
      <main className="pagina">
        <Boton to={volverA} variante="contorno" clase="boton--chico detalle-catalogo__volver">
          <Icono nombre="flechaIzq" tamano={16} /> Volver al catálogo
        </Boton>
        <div className="evento">
          <FlyerEvento evento={evento} />
          <div className="evento__contenido">
            <DatosEvento evento={evento} />
            {estado !== 'ACTIVO' && <p className="evento__finalizado">{ESTADOS[estado] || 'La venta no está habilitada.'}</p>}
            {evento.errorOfertas ? (
              <>
                <p className="catalogo-nota" role="alert">No pudimos consultar las entradas.</p>
                <Boton variante="contorno" clase="boton--chico detalle-catalogo__actualizar" onClick={onReintentar}>
                  Reintentar
                </Boton>
              </>
            ) : (
              <ListaEntradas evento={evento} volverA={volverA} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
