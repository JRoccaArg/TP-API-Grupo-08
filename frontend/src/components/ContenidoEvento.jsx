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

// La página de un evento ya cargado. Sin estado propio: recibe lo que se ve y avisa lo que hace el usuario (agregar, reintentar)
export default function ContenidoEvento({ evento, ahora, volverA, aviso, enCarrito, agregando, errorAgregar, onAgregar, onReintentar }) {
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
              <ListaEntradas evento={evento} ahora={ahora} enCarrito={enCarrito} agregando={agregando}
                errorAgregar={errorAgregar} onAgregar={onAgregar} />
            )}
            {aviso && <p className="catalogo-nota" role="status">{aviso}</p>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
