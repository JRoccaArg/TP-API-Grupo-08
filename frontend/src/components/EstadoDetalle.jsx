import Aviso from './Aviso.jsx'
import Boton from './Boton.jsx'

// Lo que se ve en lugar del evento cuando todavía no se puede mostrar (ver detalleDisponible): el id no es válido,
// se está cargando, el evento no existe (o es un borrador) o falló la carga.
export default function EstadoDetalle({ idValido, cargando, error, evento, volverA, onReintentar }) {
  if (!idValido) return <Aviso mensaje="No encontramos este evento." boton="Volver al catálogo" to={volverA} />
  if (cargando) return <main className="pagina aviso detalle-catalogo" role="status"><h1>Cargando evento…</h1></main>
  if (error?.estado === 404 || evento?.estado?.toUpperCase() === 'BORRADOR') {
    return <Aviso mensaje="No encontramos este evento." boton="Volver al catálogo" to={volverA} />
  }
  if (error) {
    return (
      <main className="pagina aviso detalle-catalogo">
        <h1>No pudimos cargar el evento.</h1><p role="alert">{error.message}</p>
        <Boton onClick={onReintentar}>Reintentar</Boton>
        <Boton to={volverA} variante="contorno">Volver al catálogo</Boton>
      </main>
    )
  }
  return null
}
