import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Boton from './Boton.jsx'
import { obtenerImagenes, obtenerOfertas } from '../redux/eventosSlice'
import { ordenarImagenes, urlImagen } from '../utils/apiEventos.js'
import { diaYFecha, horario } from '../utils/fechas.js'
import { miles } from '../utils/formatos.js'

export default function FilaEventoAdmin({ evento }) {
  const { sesion } = useSelector((state) => state.usuario)
  const dispatch = useDispatch()

  // Como las tarjetas del catálogo: cada fila pide sus entradas y sus fotos una sola vez (con el token, por los borradores)
  useEffect(() => {
    if (!evento.ofertas) dispatch(obtenerOfertas({ eventoId: evento.id, token: sesion.token }))
  }, [dispatch, evento.id, evento.ofertas, sesion.token])

  useEffect(() => {
    if (!evento.imagenes) dispatch(obtenerImagenes({ eventoId: evento.id, token: sesion.token }))
  }, [dispatch, evento.id, evento.imagenes, sesion.token])

  const activo = evento.estado === 'ACTIVO'
  const portada = ordenarImagenes((evento.imagenes || []).map((imagen) => urlImagen(evento.id, imagen)))[0]
  const disponibles = (evento.ofertas || []).reduce((total, oferta) => total + oferta.cantidadDisponible, 0)

  return (
    <li className={`fila-admin ${activo ? '' : 'fila-admin--pasada'}`}>
      {portada ? (
        <img src={portada.url} alt={`Portada de ${evento.titulo}`} />
      ) : (
        <span className="fila-admin__sin-foto">Sin foto</span>
      )}
      <div>
        <h3>{evento.titulo}</h3>
        <p>
          {diaYFecha(evento.fechaHoraInicio)} · {horario(evento.fechaHoraInicio, evento.fechaHoraFin)} ·{' '}
          {evento.locacionNombre}
        </p>
      </div>
      <p className={`fila-admin__estado ${activo ? 'oro-texto' : ''}`}>{evento.estado}</p>
      <div className="fila-admin__ventas">
        {!evento.ofertas ? (
          <p>Cargando entradas…</p>
        ) : evento.errorOfertas ? (
          <p>Entradas sin confirmar</p>
        ) : (
          <>
            <p>{evento.ofertas.length} tipos de entrada</p>
            <strong>{miles(disponibles)} disponibles</strong>
          </>
        )}
      </div>
      <div className="fila-admin__acciones">
        <Boton to={`/admin/${evento.id}`} variante="contorno" clase="boton--chico">
          Ver evento
        </Boton>
      </div>
      {evento.errorEdicion && <p className="admin__aviso admin__aviso--error fila-tipo__aviso" role="alert">{evento.errorEdicion}</p>}
    </li>
  )
}
