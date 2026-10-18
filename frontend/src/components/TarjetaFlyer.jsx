import { Link, useLocation } from 'react-router-dom'
import Icono from './Icono.jsx'
import ImagenEvento from './ImagenEvento.jsx'
import { fechaLarga } from '../utils/fechas.js'
import { precio } from '../utils/formatos.js'
import { resumenEntradas, precioDesdeEnRango } from '../utils/eventos.js'

const ETIQUETAS = {
  EN_VENTA: 'Entradas disponibles',
  AGOTADO: 'Entradas agotadas',
  PROXIMAMENTE: 'Próximamente a la venta',
  FINALIZADO: 'Evento finalizado',
  VENTA_FINALIZADA: 'Venta finalizada',
  PAUSADO: 'Venta pausada',
  SIN_ENTRADAS: 'Sin entradas publicadas',
  ERROR: 'Disponibilidad sin confirmar',
  CANCELADO: 'Evento cancelado',
  REPROGRAMADO: 'Evento reprogramado',
}

export default function TarjetaFlyer({ evento, ahora, indice = 0, filtroPrecio = {} }) {
  const location = useLocation()
  const { estado, precioDesde: precioGeneral } = resumenEntradas(evento, ahora)
  const hayRango = Boolean(filtroPrecio.precioMin || filtroPrecio.precioMax)
  const precioDesde = hayRango ? precioDesdeEnRango(evento, filtroPrecio, ahora) : precioGeneral
  const destino = `/eventos/${evento.id}`
  const origen = { volverA: `${location.pathname}${location.search}#fechas` }
  const fecha = new Date(evento.fechaHoraInicio)
  const fechaValida = Boolean(evento.fechaHoraInicio) && Number.isFinite(fecha.getTime())
  const tienePrecio = estado === 'EN_VENTA' && typeof precioDesde === 'number' && Number.isFinite(precioDesde)
  const inactivo = ['FINALIZADO', 'CANCELADO', 'VENTA_FINALIZADA'].includes(estado)

  return (
    <article
      className={`flyer catalogo-tarjeta flotar ${inactivo ? 'flyer--pasado' : ''}`}
      style={{ animationDelay: `-${indice * 1.5}s` }}
    >
      <Link to={destino} state={origen} className="flyer__imagen" aria-label={`Ver detalle de ${evento.titulo}`}>
        <ImagenEvento imagen={evento.imagenes?.[0]} titulo={evento.titulo} className="flyer__visual" />
        <span className="flyer__fecha">{fechaValida ? fechaLarga(evento.fechaHoraInicio) : 'Fecha a confirmar'}</span>
      </Link>
      <div className="flyer__pie">
        <p className="catalogo-tarjeta__categoria">{evento.categoriaNombre || 'Evento'}</p>
        <h3 className="catalogo-tarjeta__titulo"><Link to={destino} state={origen}>{evento.titulo || 'Evento sin título'}</Link></h3>
        <p className="catalogo-tarjeta__horario">
          {fechaValida ? <time dateTime={evento.fechaHoraInicio}>{fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} · {fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} h</time> : 'Fecha y horario a confirmar'}
        </p>
        <p className="flyer__lugar">
          <strong>{evento.locacionNombre || 'Lugar a confirmar'}</strong>
          {evento.locacionDireccion && <span>{evento.locacionDireccion}</span>}
        </p>
        <p className={`catalogo-tarjeta__estado catalogo-tarjeta__estado--${estado.toLowerCase()}`}>{ETIQUETAS[estado] || 'Consultá el detalle'}</p>
        <div className="flyer__accion">
          {tienePrecio ? (
            <p><small>{hayRango ? 'DESDE · EN TU RANGO' : 'DESDE · PRECIO FINAL'}</small><strong className="oro-texto">{precio(precioDesde)}</strong></p>
          ) : (
            <p className="catalogo-tarjeta__sin-precio">{estado === 'ERROR' ? 'Precio sin confirmar' : 'Conocé los detalles'}</p>
          )}
          <Link to={destino} state={origen} className="catalogo-tarjeta__detalle" aria-label={`Ver detalle de ${evento.titulo}`}>
            Ver detalle <Icono nombre="diagonal" tamano={16} />
          </Link>
        </div>
      </div>
    </article>
  )
}
