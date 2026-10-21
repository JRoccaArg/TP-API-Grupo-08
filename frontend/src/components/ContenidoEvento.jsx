import Boton from './Boton.jsx'
import BarraCompra from './BarraCompra.jsx'
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

// La página de un evento ya cargado. Sin estado propio: recibe lo que se ve y avisa lo que hace el usuario (cambiar cantidad, actualizar, confirmar)
export default function ContenidoEvento({ evento, seleccion, ahora, volverA, aviso, enviando, conectado, onCambiar, onActualizar, onConfirmar }) {
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
            {(evento.errorOfertas || evento.errorImagenes) && (
              <Boton variante="contorno" clase="boton--chico detalle-catalogo__actualizar" onClick={onActualizar} deshabilitado={enviando}>
                Actualizar disponibilidad e imágenes
              </Boton>
            )}
            {evento.errorOfertas ? (
              <p className="catalogo-nota" role="alert">No pudimos consultar las entradas. Reintentá actualizando la disponibilidad.</p>
            ) : (
              <>
                <ListaEntradas evento={evento} seleccion={seleccion} onCambiar={onCambiar} ahora={ahora} />
                {estado === 'ACTIVO' && evento.ofertas.length > 0 && (
                  <BarraCompra seleccion={seleccion} ofertas={evento.ofertas} onConfirmar={onConfirmar}
                    conectado={conectado} enviando={enviando} />
                )}
              </>
            )}
            {aviso && <p className="catalogo-nota" role="status">{aviso}</p>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
