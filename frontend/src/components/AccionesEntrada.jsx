import { useEffect, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import Boton from './Boton.jsx'
import { compartirImagen, nombreArchivo } from '../utils/imagenEntrada.js'
import { urlVerificacion } from '../utils/verificacion.js'

// Descargar el QR como PNG y compartirlo con el menú del celular. La imagen sale de un <canvas> oculto que dibuja qrcode.react:
// toDataURL la da como texto para el link de descarga y toBlob como archivo para compartir. El canvas se lee con useRef.
export default function AccionesEntrada({ entrada, titulo }) {
  const lienzo = useRef(null)
  const [png, setPng] = useState('')
  const [imagen, setImagen] = useState(null)
  const [aviso, setAviso] = useState('')
  const archivo = nombreArchivo(titulo, entrada.codigoQr)

  useEffect(() => {
    setPng(lienzo.current.toDataURL('image/png'))
    lienzo.current.toBlob(setImagen, 'image/png')
  }, [entrada.codigoQr])

  const compartir = async () => {
    setAviso('')
    setAviso(await compartirImagen(imagen, archivo, `Mi entrada para ${titulo}`))
  }

  return (
    <>
      <QRCodeCanvas ref={lienzo} value={urlVerificacion(entrada.codigoQr)} size={600} marginSize={4} level="M" className="acciones-entrada__lienzo" aria-hidden="true" />
      <div className="tarjeta-entrada__acciones">
        <a className="boton boton--oro oro-relleno brillo" href={png || undefined} download={archivo}>
          Descargar
        </a>
        <Boton variante="oscuro" deshabilitado={!imagen} onClick={compartir}>
          Compartir
        </Boton>
      </div>
      {aviso && <p className="tarjeta-entrada__aviso" role="status">{aviso}</p>}
    </>
  )
}
