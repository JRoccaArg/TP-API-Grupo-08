import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import CompraOk from '../components/CompraOk.jsx'
import { obtenerCompra } from '../utils/apiCompras.js'
import { obtenerEventosPorId } from '../utils/apiEventos.js'
import { idsDeEventosDeCompras } from '../utils/compras.js'

// Pantalla "/compra/:id": lo que se compró, con sus entradas. Al pagar se llega con la compra que respondió el back
// (en el state del router, sin pedirla de nuevo); si se recarga la página o se entra por un link, se pide por su id.
export default function CompraConfirmada({ usuario }) {
  const { id } = useParams()
  const { state } = useLocation()
  const token = usuario?.rol === 'USER' ? usuario.token : null
  const [compra, setCompra] = useState(state?.compra?.id === Number(id) ? state.compra : null)
  const [eventos, setEventos] = useState(null) // { id: evento } de cada entrada; null mientras se piden
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token || compra) return undefined
    let activo = true
    obtenerCompra(token, id)
      .then((encontrada) => { if (activo) setCompra(encontrada) })
      .catch((fallo) => {
        // Una compra ajena o inexistente se ve igual: el back responde 403 o 404.
        if (activo) setError([400, 403, 404].includes(fallo.estado) ? 'No encontramos esta compra.' : fallo.message)
      })
    return () => { activo = false }
  }, [token, id, compra])

  useEffect(() => {
    if (!compra) return undefined
    let activo = true
    obtenerEventosPorId(idsDeEventosDeCompras([compra])).then((pedidos) => { if (activo) setEventos(pedidos) })
    return () => { activo = false }
  }, [compra])

  if (!token) return <AvisoAcceso usuario={usuario} para="USER" sinSesion="Ingresá para ver tu compra." />
  if (error) return <Aviso mensaje={error} boton="Ver mis entradas" to="/mis-entradas" />
  if (!compra || !eventos) {
    return <main className="pagina compra"><p className="admin__cargando" role="status">Cargando tu compra…</p></main>
  }
  return <CompraOk compra={compra} eventos={eventos} />
}
