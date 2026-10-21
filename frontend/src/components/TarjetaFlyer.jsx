import { Link, useLocation } from 'react-router-dom'
import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import ImagenEvento from './ImagenEvento.jsx'
import { fechaLarga } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'
import { resumenEntradas } from '../utils/eventos.js'
import { precioDesdeEnRango } from '../utils/filtrosCatalogo.js'

// Qué se muestra en lugar del precio cuando el evento no tiene entradas a la venta.
const ETIQUETAS = {
  AGOTADO: 'ENTRADAS AGOTADAS',
  PROXIMAMENTE: 'PRÓXIMAMENTE A LA VENTA',
  FINALIZADO: 'EDICIÓN FINALIZADA',
  VENTA_FINALIZADA: 'VENTA FINALIZADA',
  PAUSADO: 'VENTA PAUSADA',
  SIN_ENTRADAS: 'SIN ENTRADAS PUBLICADAS',
  ERROR: 'DISPONIBILIDAD SIN CONFIRMAR',
  CANCELADO: 'EVENTO CANCELADO',
  REPROGRAMADO: 'EVENTO REPROGRAMADO',
}

// Tarjeta con el flyer de un evento (estética original). El estado y el precio salen de las entradas que trae la API.
// Si el evento ya terminó o se canceló se muestra apagada y sin precio.
export default function TarjetaFlyer({ evento, ahora, indice = 0, filtroPrecio = {} }) {
  const location = useLocation()
  const { estado, precioDesde: precioGeneral } = resumenEntradas(evento, ahora)
  const hayRango = Boolean(filtroPrecio.precioMin || filtroPrecio.precioMax)
  const precioDesde = hayRango ? precioDesdeEnRango(evento, filtroPrecio, ahora) : precioGeneral
  const tienePrecio = estado === 'EN_VENTA' && typeof precioDesde === 'number' && Number.isFinite(precioDesde)
  const apagado = ['FINALIZADO', 'CANCELADO', 'VENTA_FINALIZADA', 'AGOTADO'].includes(estado)
  const etiqueta = { FINALIZADO: 'Finalizado', CANCELADO: 'Cancelado', AGOTADO: 'Agotado' }[estado]
  const destino = `/eventos/${evento.id}`
  // Al volver desde el detalle se regresa al mismo punto del catálogo (con sus filtros).
  const origen = { volverA: `${location.pathname}${location.search}#fechas` }

  return (
    <article
      className={`flyer flotar ${apagado ? 'flyer--pasado' : ''}`}
      style={{ animationDelay: `-${indice * 1.5}s` }}
    >
      <Link to={destino} state={origen} className="flyer__imagen" aria-label={`Ver detalle de ${evento.titulo}`}>
        <ImagenEvento imagen={evento.imagenes?.[0]} titulo={evento.titulo} className="flyer__visual" />
        {etiqueta && <span className={`flyer__estado flyer__estado--${estado.toLowerCase()}`}>{etiqueta}</span>}
        <span className="flyer__fecha">{evento.fechaHoraInicio ? fechaLarga(evento.fechaHoraInicio) : 'Fecha a confirmar'}</span>
      </Link>
      <div className="flyer__pie">
        <h3 className="flyer__titulo"><Link to={destino} state={origen}>{evento.titulo || 'Evento sin título'}</Link></h3>
        <p className="flyer__lugar">
          <strong>{evento.locacionNombre || 'Lugar a confirmar'}</strong>
          {evento.locacionDireccion && <span>{evento.locacionDireccion}</span>}
        </p>
        {tienePrecio ? (
          <div className="flyer__accion">
            <p>
              <small>{hayRango ? 'DESDE · EN TU RANGO' : 'DESDE'}</small>
              <strong className="oro-texto">{precio(precioDesde)}</strong>
            </p>
            <Link to={destino} state={origen} className="flyer__ir oro-relleno brillo" aria-label={`Comprar entradas para ${evento.titulo}`}>
              <Icono nombre="diagonal" />
            </Link>
          </div>
        ) : (
          <div className="flyer__accion">
            <small>{ETIQUETAS[estado] || 'CONSULTÁ EL DETALLE'}</small>
            <Boton to={destino} state={origen} variante="contorno" clase="boton--chico">
              Ver detalle
            </Boton>
          </div>
        )}
      </div>
    </article>
  )
}
