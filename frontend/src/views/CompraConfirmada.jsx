import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import CompraOk from '../components/CompraOk.jsx'
import { obtenerCompra } from '../redux/comprasSlice'
import { obtenerEvento, obtenerImagenes } from '../redux/eventosSlice'
import { idsDeEventosDeCompras } from '../utils/compras.js'
import { eventosConFotos } from '../utils/fotos.js'

// Pantalla "/compra/:id": lo que se compró, con sus entradas. Al pagar, la compra ya está en el store (no se pide de nuevo);
// si se recarga la página o se entra por un link, se pide por su id.
export default function CompraConfirmada({ usuario }) {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { items: compras, errorCompra } = useSelector((state) => state.compras)
  const { items, pedidos } = useSelector((state) => state.eventos)
  const token = usuario?.rol === 'USER' ? usuario.token : null
  const compra = compras.find((otra) => otra.id === Number(id))
  const fallo = errorCompra?.id === Number(id)
  const hayCompra = Boolean(compra)
  const ids = compra ? idsDeEventosDeCompras([compra]) : []
  // De cada evento de la compra se pide solo lo que todavía no está en el store
  const faltan = ids.filter((eventoId) => !items.some((evento) => evento.id === eventoId) && !pedidos.includes(eventoId))
  const sinFotos = items.filter((evento) => ids.includes(evento.id) && !evento.imagenes).map((evento) => evento.id)

  useEffect(() => {
    if (token && !hayCompra && !fallo) dispatch(obtenerCompra({ token, id: Number(id) }))
  }, [dispatch, token, hayCompra, fallo, id])

  useEffect(() => {
    faltan.forEach((eventoId) => dispatch(obtenerEvento({ id: eventoId })))
  }, [dispatch, faltan])

  useEffect(() => {
    sinFotos.forEach((eventoId) => dispatch(obtenerImagenes({ eventoId })))
  }, [dispatch, sinFotos])

  if (!token) return <AvisoAcceso usuario={usuario} para="USER" sinSesion="Ingresá para ver tu compra." />
  // Una compra ajena o inexistente se ve igual: el back responde 403 o 404
  if (fallo) return <Aviso mensaje="No encontramos esta compra." boton="Ver mis entradas" to="/mis-entradas" />
  if (!compra) {
    return <main className="pagina compra"><p className="admin__cargando" role="status">Cargando tu compra…</p></main>
  }
  return <CompraOk compra={compra} eventos={eventosConFotos(items, ids)} />
}
