import { useEffect, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import Boton from './Boton.jsx'
import { compartirImagen, nombreArchivo } from '../utils/imagenEntrada.js'
import { urlVerificacion } from '../utils/verificacion.js'

// Descargar el QR como PNG y compartirlo con el menú del celular. La imagen sale de un <canvas> oculto que dibuja qrcode.react
// (se pasa a PNG con toDataURL). El canvas se lee con useRef, igual que en SeccionFechas.
export default function AccionesEntrada({ entrada, titulo }) {
  const lienzo = useRef(null)
  const [png, setPng] = useState('')
  const [aviso, setAviso] = useState('')
  const archivo = nombreArchivo(titulo, entrada.codigoQr)

  useEffect(() => {
    setPng(lienzo.current.toDataURL('image/png'))
  }, [entrada.codigoQr])

  const compartir = () => {
    setAviso('')
    compartirImagen(png, archivo, `Mi entrada para ${titulo}`).then(setAviso)
  }

  return (
    <>
      <QRCodeCanvas ref={lienzo} value={urlVerificacion(entrada.codigoQr)} size={600} marginSize={4} level="M" className="acciones-entrada__lienzo" aria-hidden="true" />
      <div className="tarjeta-entrada__acciones">
        <a className="boton boton--oro oro-relleno brillo" href={png || undefined} download={archivo}>
          Descargar
        </a>
        <Boton variante="oscuro" deshabilitado={!png} onClick={compartir}>
          Compartir
        </Boton>
      </div>
      {aviso && <p className="tarjeta-entrada__aviso" role="status">{aviso}</p>}
    </>
  )
}
