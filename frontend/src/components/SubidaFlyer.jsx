import Boton from './Boton.jsx'
import Icono from './Icono.jsx'

// Zona del flyer: muestra la imagen actual con "Reemplazar", o una caja para subir una nueva.
export default function SubidaFlyer({ flyer }) {
  return (
    <div className="subida">
      <p className="admin__seccion">FLYER</p>
      {flyer ? (
        <div className="subida__actual">
          <img src={flyer} alt="Flyer actual" />
          <div>
            <strong>Flyer actual</strong>
            <p>Es la portada que se ve en las fechas.</p>
            <Boton variante="contorno" clase="boton--chico">
              Reemplazar imagen
            </Boton>
          </div>
        </div>
      ) : (
        <div className="subida__caja">
          <Icono nombre="subir" tamano={30} grosor={1.5} />
          <strong>Subí el flyer del evento</strong>
          <p>JPG o PNG. Se muestra como portada en las fechas.</p>
        </div>
      )}
    </div>
  )
}
