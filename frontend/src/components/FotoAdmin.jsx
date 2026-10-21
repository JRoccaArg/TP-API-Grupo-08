import Boton from './Boton.jsx'
import Icono from './Icono.jsx'

// Una foto de la lista del admin: miniatura, portada o galería, y sus acciones. No llama al back: avisa con callbacks lo que se pidió.
// Con conPortada={false} (fotos de una locación) no hay portada ni galería, solo la posición.
export default function FotoAdmin({ imagen, indice, total, conPortada = true, anteriorEsPortada, ocupado, quitando, onPortada, onMover, onQuitar }) {
  const esPortada = conPortada && imagen.tipoImagenEvento === 'PORTADA'
  const noPuedeSubir = ocupado || esPortada || indice === 0 || anteriorEsPortada
  const noPuedeBajar = ocupado || esPortada || indice === total - 1

  return (
    <li className={`foto-admin ${conPortada ? '' : 'foto-admin--horizontal'}`}>
      <img src={imagen.url} alt={imagen.descripcion || imagen.nombreArchivo} />
      <div>
        <p className={`foto-admin__etiqueta ${esPortada ? 'oro-texto' : ''}`}>{!conPortada ? `FOTO ${indice + 1}` : esPortada ? 'PORTADA' : 'GALERÍA'}</p>
        <p className="foto-admin__nombre">{imagen.nombreArchivo}</p>
      </div>
      <div className="foto-admin__acciones">
        {conPortada && !esPortada && (
          <Boton variante="contorno" clase="boton--chico" deshabilitado={ocupado} onClick={onPortada}>
            Hacer portada
          </Boton>
        )}
        <button type="button" className="foto-admin__mover" aria-label="Subir una posición" disabled={noPuedeSubir} onClick={() => onMover(-1)}>
          <Icono nombre="arriba" tamano={16} />
        </button>
        <button type="button" className="foto-admin__mover" aria-label="Bajar una posición" disabled={noPuedeBajar} onClick={() => onMover(1)}>
          <Icono nombre="abajo" tamano={16} />
        </button>
        <Boton variante="peligro" clase="boton--chico" deshabilitado={ocupado} onClick={onQuitar}>
          {quitando ? 'Confirmar' : 'Quitar'}
        </Boton>
      </div>
    </li>
  )
}
