import { useEffect, useRef } from 'react'
import Boton from './Boton.jsx'

// Encabezado de "Mis entradas": sin "grupo" la lista de eventos; con "grupo" los QR de ese evento (y un botón para volver si hay más de uno).
// Al pasar de la lista a un evento (o volver) se lleva la vista arriba, porque la página conservaba el desplazamiento anterior.
export default function CabeceraMisEntradas({ grupo, varios }) {
  const cabecera = useRef(null)
  const id = grupo?.id

  useEffect(() => {
    cabecera.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [id])

  return (
    <div ref={cabecera} className="mis-entradas__cabecera">
      <div>
        <p className="rotulo-oro aparece">{grupo ? 'TUS ENTRADAS PARA' : 'TUS COMPRAS'}</p>
        <h1 className="titulo-grande aparece">
          {grupo ? <span className="oro-texto">{grupo.evento?.titulo || grupo.titulo}</span> : <>Tus <span className="oro-texto">entradas</span></>}
        </h1>
        <p className="mis-entradas__bajada">
          {grupo ? 'Mostrá el QR en la puerta: cada código se usa una sola vez.' : 'Elegí un evento para ver sus QR.'}
        </p>
      </div>
      {grupo && varios ? (
        <Boton to="/mis-entradas" variante="contorno" clase="boton--chico">Todas mis entradas</Boton>
      ) : (
        <Boton to="/" variante="contorno" clase="boton--chico">Volver al inicio</Boton>
      )}
    </div>
  )
}
